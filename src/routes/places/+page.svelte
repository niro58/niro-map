<script lang="ts">
	import { getMapPlaces } from '$lib/api.js';
	import PlacesFilters from '$lib/components/places-filters.svelte';
	import Popup from '$lib/components/popup.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Seo from '$lib/components/ui/seo/seo.svelte';
	import type { PlaceResponse } from '$lib/types.js';
	import type { ResultClient } from '$lib/utils.js';
	import { ChevronLeft } from '@lucide/svelte';

	const { data } = $props();

	let places: ResultClient<PlaceResponse[]> = $state({
		type: 'NOT_ASKED'
	});

	let currentController: AbortController | null = null;
	let limit: number = $derived(Math.min(data.filters.limit, 250));
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
				const res = await getMapPlaces({
					...data.filters,
					limit
				});

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

	const page = $derived(Math.floor(data.filters.offset / data.filters.limit) + 1 || 1);
</script>

<Seo
	title={`Niro Map Browse Places - Page ${page} `}
	description="Explore over 12 million popular points of interest from Overture Maps on an interactive world map. Filter places by category, country, or search an area."
	keywords="interactive map, Overture maps, points of interest, POI explorer, data visualization, world map, place finder, PostGIS, maplibre, Svelte"
/>

<div class="flex flex-row">
	<PlacesFilters
		filters={{ ...data.filters, limit: limit }}
		{places}
		limits={['25', '50', '100', '250']}
	>
		{#snippet children({ updateKey })}
			<div class="container flex flex-col">
				{#if places.type === 'SUCCESS' && places.data.length === 0}
					<div class="col-span-3 p-4 text-center text-sm text-muted-foreground">
						No places found with the current filters.
					</div>
				{:else if places.type === 'SUCCESS'}
					<div class="grid grid-cols-3">
						{#each places.data as place (place.id)}
							<div class="m-2">
								<Popup {place} class="h-full" />
							</div>
						{/each}
					</div>
					<div class="mt-12 flex flex-row items-center justify-center gap-4">
						<Button
							disabled={!(data.filters.offset > 0)}
							onclick={() => {
								updateKey('offset', Math.max(0, (data.filters.offset || 0) - limit));
								window.scrollTo({ top: 0, behavior: 'smooth' });
							}}
						>
							<ChevronLeft />
							Previous Page
						</Button>
						<span class="px-4">Page {page}</span>
						<Button
							disabled={places.data.length < limit}
							onclick={() => {
								updateKey('offset', (data.filters.offset || 0) + limit);
								window.scrollTo({ top: 0, behavior: 'smooth' });
							}}
						>
							Next Page
							<ChevronLeft class="rotate-180" />
						</Button>
					</div>
				{/if}
			</div>
		{/snippet}
	</PlacesFilters>
</div>
