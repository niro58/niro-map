<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { getMapPlaces } from '$lib/api';
	import Map from '$lib/components/map.svelte';
	import type { PlaceResponse } from '$lib/types';
	import { type ResultClient } from '$lib/utils';

	import Seo from '$lib/components/ui/seo/seo.svelte';
	import { triggerFilter } from '$lib/filters';
	import PlacesFilters from '$lib/components/places-filters.svelte';

	const { data } = $props();

	let places: ResultClient<PlaceResponse[]> = $state({
		type: 'NOT_ASKED'
	});

	let currentController: AbortController | null = null;

	$effect(() => {
		if (currentController) {
			currentController.abort();
			currentController = null;
		}

		const controller = new AbortController();
		currentController = controller;

		places = { type: 'LOADING' };

		(async () => {
			try {
				const res = await getMapPlaces(data.filters);

				if (controller.signal.aborted) return;

				if (res.type === 'SUCCESS') {
					places = { type: 'SUCCESS', data: res.data };
				} else {
					places = { type: 'FAILURE', error: res.error };
				}
			} catch (err: any) {
				if (err?.name === 'AbortError') return;
				places = { type: 'FAILURE', error: err?.message ?? 'Unknown error' };
			} finally {
				if (currentController === controller) currentController = null;
			}
		})();
	});
</script>

<Seo
	title="Niro Map | Explore Millions of Popular Places Worldwide"
	description="Explore over 12 million popular points of interest from Overture Maps on an interactive world map. Filter places by category, country, or search an area."
	keywords="interactive map, Overture maps, points of interest, POI explorer, data visualization, world map, place finder, PostGIS, maplibre, Svelte"
/>

<div class="flex flex-row">
	<PlacesFilters filters={data.filters} {places}>
		{#snippet children({ updateKey })}
			<Map
				{places}
				endpoint={`${env.PUBLIC_API_ENDPOINT}/api/states`}
				toAverageCenter={data.filters.country.length > 0}
				onPinPlaced={(radius, point) => {
					if (!radius || !point) {
						updateKey('latitude', undefined, false);
						updateKey('longitude', undefined, false);
						updateKey('radius', undefined);
					} else {
						updateKey('latitude', point.lat, false);
						updateKey('longitude', point.lon, false);
						updateKey('radius', radius);
					}
				}}
				defaultPlacedPin={data.filters.latitude && data.filters.longitude && data.filters.radius
					? {
							radius: data.filters.radius,
							point: { lat: data.filters.latitude, lon: data.filters.longitude }
						}
					: undefined}
			/>
		{/snippet}
	</PlacesFilters>
</div>
