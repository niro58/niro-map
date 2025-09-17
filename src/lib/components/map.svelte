<script lang="ts">
	import { mount, onMount, untrack } from 'svelte';

	import { MapManager, type MapMarker } from '@arenarium/maps';
	import { MaplibreProvider, MaplibreLightStyle } from '@arenarium/maps/maplibre';
	import '@arenarium/maps/dist/style.css';
	import { X, LocateFixed } from '@lucide/svelte';
	import maplibregl from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';

	import { cn, type ResultClient } from '$lib/utils';
	import Pin from './pin.svelte';
	import Popup from './popup.svelte';
	import Button from './ui/button/button.svelte';
	import Tooltip from './tooltip.svelte';
	import type { PlaceResponse } from '$lib/types';
	import { env } from '$env/dynamic/public';
	import Slider from './ui/slider/slider.svelte';
	import Label from './ui/label/label.svelte';
	import Input from './ui/input/input.svelte';

	const {
		places,
		class: className,
		initialZoom = 5,
		center,
		toAverageCenter = true,
		onPinPlaced,
		defaultPlacedPin,
		actionButtons = true,
		highlightIds
	}: {
		places: ResultClient<PlaceResponse[]>;
		class?: string;
		initialZoom?: number;
		center?: [number, number];
		toAverageCenter?: boolean;
		onPinPlaced?: (
			radius: number | undefined,
			point: { lat: number; lon: number } | undefined
		) => void;
		defaultPlacedPin?: { radius: number; point: { lat: number; lon: number } };
		actionButtons?: boolean;
		highlightIds?: string[];
	} = $props();

	let mapManager: MapManager;
	let map: maplibregl.Map | undefined = $state();
	let mapLoaded = $state(false);
	let mapContainer: HTMLDivElement;
	let isUpdatingMarkers: ResultClient<undefined> = $state({ type: 'NOT_ASKED' });

	onMount(() => {
		const mapProvider = new MaplibreProvider(maplibregl.Map, maplibregl.Marker, {
			container: mapContainer,
			style: MaplibreLightStyle,
			center: center || [10.4515, 51.1657],
			zoom: initialZoom
		});
		mapManager = new MapManager('', mapProvider, {
			api: {
				states: {
					url: `${env.PUBLIC_API_ENDPOINT}/api/states`
				}
			}
		});

		map = mapProvider.getMap();
		map.on('click', onMapClick);
		map.on('style.load', () => {
			mapLoaded = true;
		});
	});
	$effect(() => {
		update();
	});
	$effect(() => {
		if (mapLoaded && defaultPlacedPin && defaultPlacedPin.point) {
			untrack(() => {
				pinLocation = defaultPlacedPin.point;
				pinRadiusKm = defaultPlacedPin.radius;
				updateRadiusCircle(pinLocation, pinRadiusKm);
			});
		} else if (mapLoaded && !defaultPlacedPin) {
			pinLocation = null;
			pinRadiusKm = 10;
			removeRadiusCircle();
		}
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
		map.setCenter(center);
	}
	async function update() {
		if (places.type !== 'SUCCESS' || untrack(() => isUpdatingMarkers.type === 'LOADING')) {
			return;
		}

		isUpdatingMarkers = { type: 'LOADING' };
		const markers = new Array<MapMarker>();

		if (highlightIds) {
			places.data = places.data.sort((a, b) => {
				const aHighlighted = highlightIds.includes(a.id) ? 1 : 0;
				const bHighlighted = highlightIds.includes(b.id) ? 1 : 0;
				if (aHighlighted === bHighlighted) return 0;
				return aHighlighted > bHighlighted ? -1 : 1;
			});
		}

		// let cnt = 0;
		for (let i = 0; i < places.data.length; i++) {
			const place = places.data[i];
			const rank = places.data.length - i;
			const lat = place.latitude;
			const lng = place.longitude;
			const isHighlighted = highlightIds?.includes(place.id);
			if (!lat || !lng) continue;
			// if (cnt++ >= LIMIT) break;
			markers.push({
				id: place.id,
				rank: rank,
				lat: lat,
				lng: lng,
				tooltip: {
					style: {
						width: 120,
						height: 90,
						margin: 8,
						radius: 12
					},
					body: () => getTooltipBody(place, isHighlighted || false)
				},
				pin: {
					style: {
						height: 16,
						width: 16,
						radius: 8
					},
					body: () => getPinBody()
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

		// console.log(`Markers to set: ${markers.length}`);
		// const now = performance.now();
		try {
			mapManager.removeMarkers();
			await mapManager.updateMarkers(markers);
			if (!center && toAverageCenter) {
				averageCenter();
			}
			// console.log(`[SET ${markers.length}] ${performance.now() - now}ms`);
			isUpdatingMarkers = { type: 'SUCCESS', data: undefined };
		} catch (e) {
			console.error('Error updating markers', e);
			isUpdatingMarkers = {
				type: 'FAILURE',
				error: 'Error updating markers'
			};
		}
	}

	async function getTooltipBody(
		place: PlaceResponse,
		isHighlighted: boolean
	): Promise<HTMLElement> {
		const element = document.createElement('div');
		element.addEventListener('click', (e) => onTooltipClick(e, place.id));
		mount(Tooltip, {
			target: element,
			props: {
				place,
				isHighlighted,
				width: 120,
				height: 90
			}
		});
		return element;
	}

	async function getPinBody(): Promise<HTMLElement> {
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
		event.stopPropagation();
		mapManager.showPopup(id.toString());
	}

	let isPlacingPin = $state(false);
	let pinPlacementLocked = $state(false); // New state to lock pin placement after search
	let pinLocation: { lat: number; lon: number } | null = $state(null);
	let pinRadiusKm = $state(10);

	$effect(() => {
		if (pinLocation && map) {
			updateRadiusCircle(pinLocation, pinRadiusKm);
		}
	});

	function togglePinPlacement() {
		if (pinPlacementLocked) return; // Prevent toggling if locked
		isPlacingPin = !isPlacingPin;

		if (!isPlacingPin) {
			onPinPlaced?.(undefined, undefined);
			removeRadiusCircle();
			pinLocation = null;
		}
		// Change cursor style to indicate placement mode
		if (map) {
			map.getCanvas().style.cursor = isPlacingPin ? 'crosshair' : '';
		}
	}

	function handleSearch() {
		if (!pinLocation) return;
		onPinPlaced?.(pinRadiusKm, pinLocation);
		pinPlacementLocked = true;
		isPlacingPin = false;
		if (map) map.getCanvas().style.cursor = '';
	}

	function handleSelectPlace() {
		pinLocation = null;
		pinPlacementLocked = false;
		isPlacingPin = true;
		if (map) map.getCanvas().style.cursor = 'crosshair';
	}

	function createGeoJSONCircle(
		center: { lon: number; lat: number },
		radiusKm: number,
		points = 64
	): GeoJSON.Feature<GeoJSON.Polygon> {
		const coords = {
			latitude: center.lat,
			longitude: center.lon
		};

		const km = radiusKm;
		const ret: [number, number][] = [];
		const distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
		const distanceY = km / 110.574;

		let theta, x, y;
		for (let i = 0; i < points; i++) {
			theta = (i / points) * (2 * Math.PI);
			x = distanceX * Math.cos(theta);
			y = distanceY * Math.sin(theta);
			ret.push([coords.longitude + x, coords.latitude + y]);
		}
		ret.push(ret[0]);

		return {
			type: 'Feature',
			geometry: {
				type: 'Polygon',
				coordinates: [ret]
			},
			properties: {}
		};
	}

	function updateRadiusCircle(center: { lat: number; lon: number }, radiusKm: number) {
		if (!map) return;

		const circleGeoJSON = createGeoJSONCircle(center, radiusKm);

		const source = map.getSource('radius-source');
		if (source) {
			(source as maplibregl.GeoJSONSource).setData(circleGeoJSON);
		} else {
			map.addSource('radius-source', {
				type: 'geojson',
				data: circleGeoJSON
			});
			map.addLayer({
				id: 'radius-fill-layer',
				type: 'fill',
				source: 'radius-source',
				paint: {
					'fill-color': '#EDA15E',
					'fill-opacity': 0.2
				}
			});
			map.addLayer({
				id: 'radius-outline-layer',
				type: 'line',
				source: 'radius-source',
				paint: {
					'line-color': '#EDA15E',
					'line-width': 2
				}
			});
		}
	}

	function removeRadiusCircle() {
		if (!map) return;
		if (map.getLayer('radius-fill-layer')) map.removeLayer('radius-fill-layer');
		if (map.getLayer('radius-outline-layer')) map.removeLayer('radius-outline-layer');
		if (map.getSource('radius-source')) map.removeSource('radius-source');
	}

	function onMapClick(e: maplibregl.MapMouseEvent & { lngLat: maplibregl.LngLat }) {
		if (isPlacingPin && !pinPlacementLocked) {
			pinLocation = { lat: e.lngLat.lat, lon: e.lngLat.lng };
			isPlacingPin = false;
			if (map) map.getCanvas().style.cursor = '';
		} else {
			mapManager.hidePopup();
		}
	}
</script>

<div class="relative w-full flex-1">
	{#if isUpdatingMarkers.type === 'LOADING'}
		<div
			class="pointer-events-none absolute inset-0 z-[99999999] mt-8 flex items-start justify-center"
		>
			<Button variant="outline" size="sm" class="pointer-events-auto animate-pulse"
				>Updating markers...</Button
			>
		</div>
	{/if}
	{#if actionButtons}
		<div
			class="fixed bottom-20 left-4 z-[99999999] flex h-fit flex-col gap-2 rounded-lg bg-white p-2 shadow-lg sm:absolute sm:top-4 sm:left-16"
		>
			<Button onclick={togglePinPlacement} variant="outline">
				{#if isPlacingPin}
					<X class="mr-2 h-4 w-4" />
					Close
				{:else}
					<LocateFixed class="mr-2 h-4 w-4" />
					Select Place
				{/if}
			</Button>
			{#if isPlacingPin}
				<Button
					onclick={() => {
						navigator.geolocation.getCurrentPosition((position) => {
							pinLocation = {
								lat: position.coords.latitude,
								lon: position.coords.longitude
							};
							isPlacingPin = false;
							if (map) {
								map.getCanvas().style.cursor = '';
								map.setCenter([position.coords.longitude, position.coords.latitude]);
								map.setZoom(10);
							}
						});
					}}>Use My Location</Button
				>
			{/if}
			{#if pinLocation}
				<div class="flex w-64 flex-col gap-2 border-t pt-2">
					<Label for="radius" class="text-sm font-medium">Radius: {pinRadiusKm.toFixed(1)} km</Label
					>
					<!-- Using a standard range input for simplicity. You can replace with your <Slider/> component -->
					<Slider
						type="single"
						id="radius"
						min={0.5}
						max={1000}
						step={2}
						bind:value={
							() => pinRadiusKm,
							(v) => {
								pinRadiusKm = v;
								if (pinPlacementLocked) {
									pinPlacementLocked = false;
								}
							}
						}
						class="w-full"
					/>
					<Input
						bind:value={
							() => pinRadiusKm,
							(v) => {
								pinRadiusKm = v;
								if (pinPlacementLocked) {
									pinPlacementLocked = false;
								}
							}
						}
					/>

					<Button
						onclick={handleSearch}
						size="sm"
						class="mt-2 w-full"
						disabled={pinPlacementLocked}
					>
						Search Area
					</Button>
				</div>
			{:else if isPlacingPin}
				<div class="mt-2 text-sm text-muted-foreground">Click on any point on the map</div>
			{/if}
		</div>
		<div
			class="fixed right-4 bottom-4 z-[99999999] flex h-fit flex-col gap-2 rounded-lg bg-white p-2 shadow-lg sm:absolute sm:top-4 sm:right-16"
		>
			<Button
				onclick={() => {
					averageCenter();
				}}
			>
				Refocus
			</Button>
		</div>
	{/if}
	<div class={cn('h-full flex-1', className)}>
		<div class="h-full w-full rounded-xl bg-gray-500" bind:this={mapContainer}></div>
	</div>
</div>
