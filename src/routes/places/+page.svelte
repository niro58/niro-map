<script lang="ts">
	import { getMapPlaces } from '$lib/api.js';
	import PlacesFilters from '$lib/components/places-filters.svelte';
	import Popup from '$lib/components/popup.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Seo from '$lib/components/ui/seo/seo.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
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
		pagination={false}
	>
		{#snippet children({ updateKey })}
			<div class="container flex w-full justify-center">
				<div class="mt-12 grid w-full grid-cols-1 justify-center gap-2 md:grid-cols-3">
					{#if places.type === 'SUCCESS' && places.data.length === 0}
						<div class="col-span-3 mt-12 flex flex-col items-center justify-start gap-4">
							<h2 class="text-2xl font-bold">No places found</h2>
							<p class="text-center text-muted-foreground">
								Try adjusting your filters or search area to find more places.
							</p>
						</div>
					{:else if places.type === 'SUCCESS'}
						{#each places.data as place (place.id)}
							<div class="m-2">
								<Popup {place} class="h-full" />
							</div>
						{/each}
						<div class="col-span-3 mt-12 mb-12 flex flex-row items-center justify-center gap-4">
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
					{:else if places.type === 'LOADING' || places.type === 'NOT_ASKED'}
						{#each { length: 9 }}
							<Skeleton class="mb-4 h-96 w-full rounded-lg" />
						{/each}
					{:else if places.type === 'FAILURE'}
						<div
							class="col-span-3 mt-12 flex flex-col items-center justify-start gap-4 text-red-400"
						>
							<h2 class="text-2xl font-bold">Error loading places</h2>
							<p class="text-center text-muted-foreground">
								An error occurred while fetching places: {places.error}
							</p>
						</div>
					{/if}
				</div>
			</div>
		{/snippet}
	</PlacesFilters>
</div>
