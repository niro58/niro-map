<script lang="ts">
	import { IsMobile, type ResultClient } from '$lib/utils';

	import Button from '$lib/components/ui/button/button.svelte';
	import type { GetPlacesFilters, PlaceResponse } from '$lib/types';
	import { triggerFilter } from '$lib/filters';
	import type { Snippet } from 'svelte';
	import PlacesFiltersBody from './places-filters-body.svelte';
	import { slide } from 'svelte/transition';
	import { isFilterOpen } from '$lib/store';

	const {
		filters: initialFilters,
		places,
		children,
		limits,
		pagination = true,
		openFilter = false
	}: {
		filters: GetPlacesFilters;
		places: ResultClient<PlaceResponse[]>;
		children: Snippet<[{ updateKey: typeof updateKey }]>;
		limits?: string[];
		pagination?: boolean;
		openFilter?: boolean;
	} = $props();

	function clearFilters() {
		triggerFilter({});
	}

	let filters: GetPlacesFilters = $derived(initialFilters);

	function updateKey(
		key: keyof typeof filters,
		value: GetPlacesFilters[keyof typeof filters] | undefined,
		trigger: boolean = true
	) {
		filters = { ...filters, [key]: value };
		if (!trigger) return;
		triggerFilter(filters);
	}
</script>

{#if $isFilterOpen}
	<div
		class="absolute top-16 left-0 z-[999999999] w-full rounded-b-lg bg-background px-4 pb-4 shadow-lg sm:hidden"
		in:slide={{ duration: 300 }}
		out:slide={{ duration: 300 }}
	>
		<PlacesFiltersBody {filters} {places} {limits} {pagination} />
	</div>
{/if}

<div
	class="sticky top-0 z-50 hidden h-full max-h-screen w-96 overflow-y-auto rounded-lg bg-white/90 p-4 shadow-lg backdrop-blur-sm sm:flex"
>
	<PlacesFiltersBody {filters} {places} {limits} {pagination} />
</div>
{@render children({ updateKey })}
