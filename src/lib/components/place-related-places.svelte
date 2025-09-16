<script lang="ts">
	import { getMapPlacesPartial } from '$lib/api';
	import type { PlaceResponse } from '$lib/types';
	import { cleanCategory, type ResultClient } from '$lib/utils';
	import Popup from '$lib/components/popup.svelte';
	import Skeleton from '$ui/skeleton/skeleton.svelte';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { onMount } from 'svelte';

	const { place }: { place: PlaceResponse } = $props();
	let relatedPlacesResult: ResultClient<PlaceResponse[]> = $state({ type: 'NOT_ASKED' });

	let scrollRef: HTMLDivElement | undefined = $state();

	function scrollLeft() {
		scrollRef?.scrollBy({ left: -320, behavior: 'smooth' });
	}
	function scrollRight() {
		scrollRef?.scrollBy({ left: 320, behavior: 'smooth' });
	}

	function getRelatedPlaces() {
		if (relatedPlacesResult.type === 'LOADING' || relatedPlacesResult.type === 'SUCCESS') return;
		relatedPlacesResult = { type: 'LOADING' };

		getMapPlacesPartial({
			category: place['categories.primary'] ? [place['categories.primary']] : [],
			country:
				place['addresses'] && place['addresses'].length > 0 && place['addresses'][0].country
					? [place['addresses'][0].country]
					: [],
			limit: 10,
			notName: place['names.primary'] ?? undefined
		})
			.then((res) => {
				if (res.type === 'FAILURE') {
					relatedPlacesResult = res;
					return;
				}

				relatedPlacesResult = {
					type: 'SUCCESS',
					data: res.data.filter((p) => p.ogc_fid !== place.ogc_fid)
				};
			})
			.catch((err) => {
				relatedPlacesResult = { type: 'FAILURE', error: err?.message ?? 'Unknown error' };
			});
	}
	onMount(() => {
		getRelatedPlaces();
	});
</script>

<section class="mt-12 w-full">
	<h2 class="mb-2 text-xl font-bold">Related Places</h2>
	<p class="mb-6 text-muted-foreground">
		Places in the same category (<span class="font-semibold"
			>{cleanCategory(place['categories.primary'])}</span
		>) and country
		{#if place.addresses && place.addresses.length > 0}
			(<span class="font-semibold">{place.addresses[0].country}</span>)
		{/if}
	</p>

	<div class="relative">
		<button
			type="button"
			class="absolute top-1/2 left-0 z-10 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2 shadow transition hover:bg-gray-50 disabled:opacity-40"
			onclick={scrollLeft}
			aria-label="Scroll left"
			tabindex="0"
		>
			<ChevronLeft />
		</button>
		<button
			type="button"
			class="absolute top-1/2 right-0 z-10 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2 shadow transition hover:bg-gray-50 disabled:opacity-40"
			onclick={scrollRight}
			aria-label="Scroll right"
			tabindex="0"
		>
			<ChevronRight />
		</button>

		{#if relatedPlacesResult.type === 'SUCCESS' && relatedPlacesResult.data.length > 0}
			<div
				class="scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 flex gap-4 overflow-x-auto px-8 py-2"
				bind:this={scrollRef}
			>
				{#each relatedPlacesResult.data as related (related.id)}
					<div class="max-w-xs min-w-[300px] flex-shrink-0">
						<Popup place={related} class="h-full" />
					</div>
				{/each}
			</div>
		{:else if relatedPlacesResult.type === 'SUCCESS'}
			<div class="mt-6 text-muted-foreground">No related places found.</div>
		{:else if relatedPlacesResult.type === 'LOADING' || relatedPlacesResult.type === 'NOT_ASKED'}
			<div class="flex gap-4 overflow-x-auto px-8 py-2" bind:this={scrollRef}>
				{#each { length: 3 } as _, i}
					<div class="max-w-xs min-w-[300px] flex-shrink-0">
						<Skeleton class="mb-4 h-96 w-full rounded-lg" />
					</div>
				{/each}
			</div>
		{:else if relatedPlacesResult.type === 'FAILURE'}
			<div class="mt-6 text-red-400">
				Failed to load related places: {relatedPlacesResult.error}
			</div>
		{/if}
	</div>
</section>
