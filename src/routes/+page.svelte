<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { PUBLIC_API_ENDPOINT } from '$env/static/public';
	import { getMapPlaces } from '$lib/api';
	import Map from '$lib/components/map.svelte';
	import type { PlaceResponse } from '$lib/types';
	import { cleanCategory, gotoFilter, type ResultClient, type ResultFetch } from '$lib/utils';
	import { onMount } from 'svelte';
	import * as Accordion from '$lib/components/ui/accordion/index';
	import { CATEGORIES, countries } from '$lib/const';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { page } from '$app/state';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Slider from '$lib/components/ui/slider/slider.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import * as Select from '$lib/components/ui/select/index';
	import Button from '$lib/components/ui/button/button.svelte';
	let places: ResultClient<PlaceResponse[]> = $state({
		type: 'NOT_ASKED'
	});

	$effect(() => {
		console.log('Fetching places');
		places = { type: 'LOADING' };
		getMapPlaces({
			limit: selectedLimit ? String(parseInt(selectedLimit)) : undefined,
			countries: selectedCountries,
			categories: activeCategories,
			confidenceMin: String(confidenceRange[0]),
			confidenceMax: String(confidenceRange[1]),
			latitude: latitude,
			longitude: longitude,
			radius: radius
		})
			.then((res: ResultFetch<PlaceResponse[]>) => {
				if (res.type === 'SUCCESS') {
					places = {
						type: 'SUCCESS',
						data: res.data
					};
				} else {
					places = {
						type: 'FAILURE',
						error: res.error
					};
				}
			})
			.catch((err) => {
				places = {
					type: 'FAILURE',
					error: err
				};
			});
	});

	const activeCategories = $derived(page.url.searchParams.getAll('category'));
	const confidenceRange = $derived([
		parseInt(page.url.searchParams.get('confidence_min') || '0'),
		parseInt(page.url.searchParams.get('confidence_max') || '100')
	]);
	const selectedCountries = $derived(page.url.searchParams.getAll('country'));
	const selectedLimit = $derived(page.url.searchParams.get('limit') || '10000');
	const latitude = $derived(page.url.searchParams.get('latitude') || undefined);
	const longitude = $derived(page.url.searchParams.get('longitude') || undefined);
	const radius = $derived(page.url.searchParams.get('radius') || undefined);
	function clearFilters() {
		page.url.searchParams.delete('limit');
		page.url.searchParams.delete('country');
		page.url.searchParams.delete('category');
		page.url.searchParams.delete('confidence_min');
		page.url.searchParams.delete('confidence_max');
		page.url.searchParams.delete('latitude');
		page.url.searchParams.delete('longitude');
		page.url.searchParams.delete('radius');
		gotoFilter(page.url.toString());
	}
</script>

<div class="flex flex-row gap-4">
	<div
		class="h-full max-h-screen w-64 overflow-y-auto rounded-lg bg-white/90 p-4 shadow-lg backdrop-blur-sm"
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
					value={confidenceRange}
					onValueCommit={(v) => {
						page.url.searchParams.set('confidence_min', String(v[0]));
						page.url.searchParams.set('confidence_max', String(v[1]));
						gotoFilter(page.url.toString());
					}}
				/>
				<div class="flex flex-row justify-between text-sm text-primary">
					<span>{confidenceRange[0]}%</span>
					<span>{confidenceRange[1]}%</span>
				</div>
			</div>
			<div class="flex flex-col gap-2">
				<Label for="country-select">Countries</Label>
				<Select.Root
					type="multiple"
					value={selectedCountries}
					onValueChange={(v) => {
						page.url.searchParams.delete('country');
						v.forEach((c) => page.url.searchParams.append('country', c));
						gotoFilter(page.url.toString());
					}}
				>
					<Select.Trigger id="country-select" class="w-full">
						{#if selectedCountries.length === 0}
							Select countries
						{:else}
							<div class="flex flex-row gap-1">
								{#each selectedCountries.slice(0, 3) as country, i (country)}
									<Badge>{country}</Badge>
								{/each}
								{#if selectedCountries.length > 3}
									<span class="muted">+{selectedCountries.length - 3} more</span>
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
					value={selectedLimit ?? ''}
					onValueChange={(v) => {
						if (v === '') {
							page.url.searchParams.delete('limit');
						} else {
							page.url.searchParams.set('limit', v);
						}
						gotoFilter(page.url.toString());
					}}
				>
					<Select.Trigger id="country-select" class="w-full">
						{selectedLimit}
					</Select.Trigger>
					<Select.Content class="max-h-60">
						{#each ['1000', '2500', '10000'] as limit}
							<Select.Item label={limit} value={limit} />
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>
		<h2 class="mb-4 text-xl font-bold">Categories</h2>
		<Accordion.Root type="single" class="w-full" value="item-1">
			{#each Object.entries(CATEGORIES) as [parent, categories]}
				{@const activeEls = categories.filter((c) => activeCategories.includes(c)).length}
				<Accordion.Item value={parent}>
					<Accordion.Trigger class="flex flex-row justify-between"
						>{cleanCategory(parent)}
						{#if activeEls > 0}
							<Badge>
								{activeEls}
							</Badge>
						{/if}
					</Accordion.Trigger>
					<Accordion.Content class="flex flex-col gap-2 p-2">
						{#each categories as category}
							<div class="flex flex-row items-center gap-2">
								<Checkbox
									bind:checked={
										() => activeCategories.includes(category),
										(v) => {
											console.log(v);
											if (v) {
												page.url.searchParams.append('category', category);
											} else {
												page.url.searchParams.delete('category', category);
											}
											gotoFilter(page.url.toString());
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
	<Map
		{places}
		endpoint={`${env.PUBLIC_API_ENDPOINT}/api/states`}
		toAverageCenter={selectedCountries.length > 0}
		onPinPlaced={(radius, point) => {
			if (!radius || !point) {
				page.url.searchParams.delete('latitude');
				page.url.searchParams.delete('longitude');
				page.url.searchParams.delete('radius');
			} else {
				page.url.searchParams.set('latitude', String(point.lat));
				page.url.searchParams.set('longitude', String(point.lon));
				page.url.searchParams.set('radius', String(radius));
			}
			gotoFilter(page.url.toString());
		}}
		defaultPlacedPin={latitude && longitude && radius
			? { radius: Number(radius), point: { lat: Number(latitude), lon: Number(longitude) } }
			: undefined}
	/>
</div>
