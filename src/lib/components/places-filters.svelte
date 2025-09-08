<script lang="ts">
	import { cleanCategory, gotoFilter, type ResultClient, type ResultFetch } from '$lib/utils';
	import * as Accordion from '$lib/components/ui/accordion/index';
	import { CATEGORIES, countries } from '$lib/const';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { page } from '$app/state';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Slider from '$lib/components/ui/slider/slider.svelte';
	import * as Select from '$lib/components/ui/select/index';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { GetPlacesFilters, PlaceResponse } from '$lib/types';
	import { triggerFilter } from '$lib/filters';
	import type { Snippet } from 'svelte';

	const {
		filters: initialFilters,
		places,
		children,
		limits
	}: {
		filters: GetPlacesFilters;
		places: ResultClient<PlaceResponse[]>;
		children: Snippet<[{ updateKey: typeof updateKey }]>;
		limits?: string[];
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

<div
	class="h-full max-h-screen w-96 overflow-y-auto rounded-lg bg-white/90 p-4 shadow-lg backdrop-blur-sm"
>
	{#if places.type === 'LOADING' || places.type === 'NOT_ASKED'}
		<div class="mb-4 rounded-lg bg-primary/10 p-4 text-center text-primary shadow-sm">
			<div class="font-semibold">Loading places...</div>
		</div>
	{:else if places.type === 'FAILURE'}
		<div class="mb-4 rounded-lg bg-destructive/10 p-4 text-center text-destructive shadow-sm">
			<div class="font-semibold">Error loading places</div>
			<div class="text-sm">{places.error}</div>
		</div>
	{:else if places.type === 'SUCCESS' && places.data.length === 0}
		<div class="mb-4 rounded-lg bg-accent/10 p-4 text-center text-accent shadow-sm">
			<div class="font-semibold">No places found</div>
		</div>
	{:else if places.type === 'SUCCESS' && places.data.length > 0}
		<div class="bg-success/10 text-success mb-4 rounded-lg p-4 text-center shadow-sm">
			<div class="font-semibold">{places.data.length} places found</div>
		</div>
	{/if}
	<Button
		class="mb-4 w-full"
		variant="outline"
		onclick={() => {
			clearFilters();
		}}
	>
		Clear all filters
	</Button>
	<h2 class="mb-4 text-xl font-bold">Filters</h2>
	<div class="mb-5 flex flex-col gap-4">
		<div class="flex flex-col gap-2">
			<Label for="confidence-slider">Confidence</Label>
			<Slider
				type="multiple"
				value={[filters.confidenceMin, filters.confidenceMax]}
				onValueCommit={(v) => {
					updateKey('confidenceMin', v[0], false);
					updateKey('confidenceMax', v[1]);
				}}
			/>
			<div class="flex flex-row justify-between text-sm text-primary">
				<span>{filters.confidenceMin}%</span>
				<span>{filters.confidenceMax}%</span>
			</div>
		</div>
		<div class="flex flex-col gap-2">
			<Label for="country-select">Countries</Label>
			<Select.Root
				type="multiple"
				value={filters.country}
				onValueChange={(v) => {
					updateKey('country', v.length > 0 ? v : undefined);
				}}
			>
				<Select.Trigger id="country-select" class="w-full">
					{#if filters.country.length === 0}
						Select countries
					{:else}
						<div class="flex flex-row gap-1">
							{#each filters.country.slice(0, 3) as country, i (country)}
								<Badge>{country}</Badge>
							{/each}
							{#if filters.country.length > 3}
								<span class="muted">+{filters.country.length - 3} more</span>
							{/if}
						</div>
					{/if}
				</Select.Trigger>
				<Select.Content class="max-h-60">
					{#each countries as country}
						<Select.Item label={country} value={country} />
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
		<div class="flex flex-col gap-2">
			<Label for="limit-select">Limit</Label>
			<Select.Root
				type="single"
				value={filters.limit.toString() ?? ''}
				onValueChange={(v) => {
					updateKey('limit', v ? parseInt(v) : undefined);
				}}
			>
				<Select.Trigger id="country-select" class="w-full">
					{filters.limit}
				</Select.Trigger>
				<Select.Content class="max-h-60">
					{#each limits || ['500', '1000', '2500', '5000', '10000'] as limit}
						<Select.Item label={limit} value={limit} />
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	</div>
	<h2 class="mb-4 text-xl font-bold">Categories</h2>
	<Accordion.Root type="single" class="w-full" value="item-1">
		{#each Object.entries(CATEGORIES) as [parent, categories]}
			{@const activeEls = categories.filter((c) => filters.category.includes(c)).length}
			<Accordion.Item value={parent}>
				<Accordion.Trigger class="flex flex-row justify-between"
					>{cleanCategory(parent)}
					{#if activeEls > 0}
						<Badge>
							{activeEls}
						</Badge>
					{/if}
				</Accordion.Trigger>
				<div class="mb-2 grid grid-cols-2 gap-2">
					<Button
						size="sm"
						onclick={() => {
							updateKey('category', [...new Set([...filters.category, ...categories])]);
						}}>Select All</Button
					>
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							let categories = [...filters.category];
							updateKey(
								'category',
								categories.filter((c) => !categories.includes(c))
							);
						}}>Deselect</Button
					>
				</div>
				<Accordion.Content class="flex flex-col gap-2 p-2">
					{#each categories as category}
						<div class="flex flex-row items-center gap-2">
							<Checkbox
								bind:checked={
									() => filters.category.includes(category),
									(v) => {
										let categories: string[] = [...filters.category];

										if (!v) {
											categories = filters.category.filter((c) => c !== category);
										} else {
											categories.push(category);
										}

										updateKey('category', categories);
									}
								}
								id={category}
							/>
							<Label for={category}>{cleanCategory(category)}</Label>
						</div>
					{/each}
				</Accordion.Content>
			</Accordion.Item>
		{/each}
	</Accordion.Root>
</div>
{@render children({ updateKey })}
