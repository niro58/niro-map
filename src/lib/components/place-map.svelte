<script lang="ts">
	import { getMapPlacesPartial } from '$lib/api.js';
	import Map from '$lib/components/map.svelte';

	import { type PlaceResponse } from '$lib/types.js';
	import { type ResultClient } from '$lib/utils.js';
	import Badge from '$ui/badge/badge.svelte';
	import Checkbox from '$ui/checkbox/checkbox.svelte';
	import Label from '$ui/label/label.svelte';
	import { MapPin, Loader2 } from '@lucide/svelte';

	const { place }: { place: PlaceResponse } = $props();

	let franchisePlaces: ResultClient<PlaceResponse[]> = $state({ type: 'NOT_ASKED' });
	let closestPlacesResult: ResultClient<PlaceResponse[]> = $state({ type: 'NOT_ASKED' });
	let activePlaces: ('place' | 'franchise' | 'closest')[] = $state(['place']);
	const CLOSEST_PLACES_RADIUS_KM = 10;
	const places = $derived.by(() => {
		let pl: PlaceResponse[] = [];

		activePlaces.forEach((m) => {
			switch (m) {
				case 'place':
					pl.push(place);
					break;
				case 'franchise':
					if (franchisePlaces.type === 'SUCCESS') {
						pl.push(...franchisePlaces.data);
					}
					break;
				case 'closest':
					if (closestPlacesResult.type === 'SUCCESS') {
						pl.push(...closestPlacesResult.data);
					}
					break;
			}
		});

		return pl;
	});

	const mapCenterWithOffset = [place.longitude, place.latitude];

	function getFranchisePlaces() {
		if (franchisePlaces.type === 'LOADING' || franchisePlaces.type === 'SUCCESS') return;
		franchisePlaces = { type: 'LOADING' };

		getMapPlacesPartial({
			name: place['names.primary']
		})
			.then((res) => {
				if (res.type === 'FAILURE') {
					franchisePlaces = res;
					return;
				}
				franchisePlaces = {
					type: 'SUCCESS',
					data: res.data.filter((p) => p.ogc_fid !== place.ogc_fid)
				};
			})
			.catch((err) => {
				franchisePlaces = { type: 'FAILURE', error: err?.message ?? 'Unknown error' };
			});
	}
	function getClosestPlaces() {
		if (closestPlacesResult.type === 'LOADING' || closestPlacesResult.type === 'SUCCESS') return;
		closestPlacesResult = { type: 'LOADING' };

		getMapPlacesPartial({
			latitude: place.latitude,
			longitude: place.longitude,
			radius: CLOSEST_PLACES_RADIUS_KM
		})
			.then((res) => {
				if (res.type === 'FAILURE') {
					closestPlacesResult = res;
					return;
				}

				closestPlacesResult = {
					type: 'SUCCESS',
					data: res.data.filter((p) => p.ogc_fid !== place.ogc_fid)
				};
			})
			.catch((err) => {
				closestPlacesResult = { type: 'FAILURE', error: err?.message ?? 'Unknown error' };
			});
	}

	const mapFilters: {
		label: 'place' | 'franchise' | 'closest';
		name: string;
		isLoading: () => boolean;
		count: () => number | undefined;
		onclick: () => void;
	}[] = $derived([
		{ label: 'place', name: 'Place', isLoading: () => false, count: () => 1, onclick: () => {} },
		{
			label: 'franchise',
			name: 'Franchise Locations',
			isLoading: () => franchisePlaces.type === 'LOADING',
			count: () => (franchisePlaces.type === 'SUCCESS' ? franchisePlaces.data.length : undefined),
			onclick: getFranchisePlaces
		},
		{
			label: 'closest',
			name: `Closest Places (within ${CLOSEST_PLACES_RADIUS_KM} km)`,
			isLoading: () => closestPlacesResult.type === 'LOADING',
			count: () =>
				closestPlacesResult.type === 'SUCCESS' ? closestPlacesResult.data.length : undefined,
			onclick: getClosestPlaces
		}
	]);
</script>

<section class="h-full rounded-lg bg-card p-6 shadow-sm">
	<h2 class="text-xl font-semibold text-foreground">Location</h2>
	<!-- Addresses -->
	<div class="mt-4 space-y-4">
		{#if place.addresses && place.addresses.length > 0}
			{#each place.addresses as addr, i}
				<div class="rounded-md border border-border p-4">
					<p class="font-semibold text-foreground">
						{addr.freeform ?? 'Address ' + (i + 1)}
					</p>
					<p class="text-sm text-muted-foreground">
						{[addr.locality, addr.region, addr.country, addr.postcode].filter(Boolean).join(', ')}
					</p>
				</div>
			{/each}
		{:else}
			<p class="text-sm text-muted-foreground">No address data available.</p>
		{/if}
	</div>
	<!-- Map -->
	<div class="my-2 flex flex-col gap-2 md:flex-row">
		{#each mapFilters as btn}
			{@const id = `toggle-${btn.label}`}
			<Label
				for={id}
				class="flex cursor-pointer flex-row items-center gap-2 rounded-md border border-primary px-3 py-2 select-none hover:bg-primary/10"
			>
				<Checkbox
					{id}
					bind:checked={
						() => activePlaces.includes(btn.label),
						(v) => {
							if (v) activePlaces = [...activePlaces, btn.label];
							else activePlaces = activePlaces.filter((m) => m !== btn.label);

							btn.onclick();
						}
					}
				/>
				{btn.name}
				{#if btn.isLoading()}
					<div class="animate-spin text-muted-foreground">
						<Loader2 class="h-4" />
					</div>
				{:else if btn.count() !== undefined}
					<Badge class="ml-1">{btn.count()}</Badge>
				{/if}
			</Label>
		{/each}
	</div>
	<div class="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
		<MapPin class="h-4 w-4" />
		<span class="font-medium"
			>{places.length} {places.length === 1 ? 'place' : 'places'} shown on map</span
		>
	</div>

	<div class="mt-6 w-full overflow-hidden rounded-md border border-border">
		<Map
			class="h-96 w-full md:h-[26rem]"
			actionButtons={false}
			places={{ type: 'SUCCESS', data: places }}
			highlightIds={[place.id]}
			initialZoom={10}
			center={mapCenterWithOffset as [number, number]}
			defaultPlacedPin={activePlaces.includes('closest')
				? {
						radius: CLOSEST_PLACES_RADIUS_KM,
						point: { lat: place.latitude, lon: place.longitude }
					}
				: undefined}
		/>
	</div>
</section>
