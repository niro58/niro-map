<script lang="ts">
	import { mount, onMount, untrack } from 'svelte';

	import { MapManager, type MapMarker } from '@arenarium/maps';
	import { MaplibreProvider, MaplibreLightStyle } from '@arenarium/maps/maplibre';
	import '@arenarium/maps/dist/style.css';
	import { Minimize2, Expand } from '@lucide/svelte';
	import maplibregl from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';

	import { cn, type ResultClient } from '$lib/utils';
	import Pin from './pin.svelte';
	import Popup from './popup.svelte';
	import Button from './ui/button/button.svelte';
	import Tooltip from './tooltip.svelte';
	import type { PlaceResponse } from '$lib/types';
	import { env } from '$env/dynamic/public';

	const {
		places,
		endpoint,
		class: className,
		initialZoom = 5,
		center
	}: {
		places: ResultClient<PlaceResponse[]>;
		endpoint?: string;
		class?: string;
		initialZoom?: number;
		center?: [number, number];
	} = $props();

	const LIMIT = 100;
	let mapManager: MapManager;
	let map: maplibregl.Map | undefined = $state();
	let mapContainer: HTMLDivElement;
	let isUpdatingMarkers: ResultClient<undefined> = $state({ type: 'NOT_ASKED' });

	onMount(() => {
		const mapProvider = new MaplibreProvider(maplibregl.Map, maplibregl.Marker, {
			container: mapContainer,
			style: MaplibreLightStyle,
			center: center || [10.4515, 51.1657],
			zoom: initialZoom
		});
		mapManager = new MapManager(env.PUBLIC_MAP_API_KEY, mapProvider, {
			api: endpoint
				? {
						states: { url: endpoint }
					}
				: undefined,
			animation: {
				queue: {
					limit: 10
				}
			}
		});

		map = mapProvider.getMap();
		map.on('click', onMapClick);
	});
	$effect(() => {
		update();
	});

	async function averageCenter() {
		if (places.type !== 'SUCCESS' || !map) {
			return;
		}
		const latSum = places.data.reduce((sum, loc) => sum + (loc.latitude || 0), 0);
		const lngSum = places.data.reduce((sum, loc) => sum + (loc.longitude || 0), 0);

		const center = {
			lat: latSum / places.data.length,
			lng: lngSum / places.data.length
		};
		console.log('Centering map to:', center);
		map.setCenter(center);
	}
	async function update() {
		if (places.type !== 'SUCCESS' || untrack(() => isUpdatingMarkers.type === 'LOADING')) {
			return;
		}

		console.log('Updating markers...');
		isUpdatingMarkers = { type: 'LOADING' };
		const markers = new Array<MapMarker>();

		let cnt = 0;
		for (let i = 0; i < places.data.length; i++) {
			const place = places.data[i];
			const rank = places.data.length - i;
			const lat = place.latitude;
			const lng = place.longitude;

			if (!lat || !lng) continue;
			if (cnt++ >= LIMIT) break;
			console.log(place.id, place.latitude, place.longitude);
			markers.push({
				id: place.id,
				rank: rank,
				lat: lat,
				lng: lng,
				tooltip: {
					style: {
						width: 120,
						height: 80,
						margin: 8,
						radius: 12
					},
					body: () => getTooltipBody(place)
				},
				pin: {
					style: {
						height: 16,
						width: 16,
						radius: 8
					},
					body: () => getPinBody(place)
				},
				popup: {
					style: {
						width: 250,
						height: 180,
						margin: 8,
						radius: 16
					},
					body: () => getPopupBody(place)
				}
			});
		}

		console.log(`Markers to set: ${markers.length}`);
		const now = performance.now();
		try {
			mapManager.removeMarkers();
			await mapManager.updateMarkers(markers);
			if (!center) {
				averageCenter();
			}
			console.log(`[SET ${markers.length}] ${performance.now() - now}ms`);
			isUpdatingMarkers = { type: 'SUCCESS', data: undefined };
		} catch (e) {
			console.error('Error updating markers', e);
			isUpdatingMarkers = {
				type: 'FAILURE',
				error: 'Error updating markers'
			};
		}
	}

	function remove() {
		mapManager.removeMarkers();
	}

	async function getTooltipBody(place: PlaceResponse): Promise<HTMLElement> {
		const element = document.createElement('div');
		element.addEventListener('click', (e) => onTooltipClick(e, place.id));
		mount(Tooltip, {
			target: element,
			props: {
				place,
				width: 120,
				height: 80
			}
		});
		return element;
	}

	async function getPinBody(place: PlaceResponse): Promise<HTMLElement> {
		const element = document.createElement('div');
		mount(Pin, {
			target: element
		});
		return element;
	}

	async function getPopupBody(place: PlaceResponse): Promise<HTMLElement> {
		const element = document.createElement('div');

		mount(Popup, {
			target: element,
			props: {
				place,
				width: 250,
				height: 180
			}
		});
		return element;
	}

	function onTooltipClick(event: Event, id: string) {
		console.log('Tooltip clicked for hotel:', id);
		event.stopPropagation();
		mapManager.showPopup(id.toString());
	}

	function onMapClick() {
		console.log('Hiding popup on map click');
		mapManager.hidePopup();
	}
</script>

<div class={cn('h-screen flex-1', className)}>
	<div class="h-full w-full rounded-xl bg-gray-500" bind:this={mapContainer}></div>
</div>
