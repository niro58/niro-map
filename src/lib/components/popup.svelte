<script lang="ts">
	import { ChevronRight } from '@lucide/svelte';
	import Button from './ui/button/button.svelte';
	import type { PlaceResponse } from '$lib/types';
	import { cleanCategory, cleanWebsite, cn, googleMapsLink, toArrayField } from '$lib/utils';
	import Separator from './ui/separator/separator.svelte';

	let {
		place,
		width,
		height,
		class: className
	}: {
		place: PlaceResponse;
		width?: number;
		height?: number;
		class?: string;
	} = $props();

	const websites = toArrayField(place?.websites);
	const socials = toArrayField(place?.socials);
	const emails = toArrayField(place?.emails);
	const phones = toArrayField(place?.phones);

	const placesPath = `/places/${place?.ogc_fid}`;
</script>

<div
	class={cn(
		'flex flex-col items-start rounded-xl bg-card text-card-foreground shadow-xl transition-all duration-300 ease-in-out',
		className
	)}
	style="width: {width}px; "
>
	<!-- Header -->
	<div class="w-full border-b border-border p-4">
		<h3 class="truncate text-lg font-semibold" title={place['names.primary'] ?? place.id}>
			{place['names.primary'] ?? place.id}
		</h3>
		<div class="mt-1 text-sm text-muted-foreground">
			{cleanCategory(place['categories.primary'])}
			{#if place['categories.alternate'] && place['categories.alternate'].length > 0}
				· {place['categories.alternate'].map((v) => cleanCategory(v)).join(', ')}
			{/if}
		</div>
		<div class="mt-2 text-xs text-muted-foreground">
			Confidence: {Math.round((place.confidence ?? 0) * 100)}%
		</div>
	</div>

	<div class="w-full space-y-3 p-4">
		<!-- Address -->
		{#if place.addresses && place.addresses.length > 0}
			<div>
				<div class="text-sm font-medium">Address</div>
				<div class="text-sm text-foreground">
					{#each place.addresses as addr, i}
						<div class="mt-1">
							<div>{addr.freeform ?? `${addr.locality ?? ''} ${addr.postcode ?? ''}`}</div>
							<div class="text-xs text-muted-foreground">
								{addr.locality}{#if addr.locality && addr.region},
								{/if}{addr.region}{#if (addr.locality || addr.region) && addr.country},
								{/if}{addr.country}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Contact & Links -->
		<div>
			<div class="text-sm font-medium">Contact & Links</div>
			<div class="mt-1 space-y-1 text-sm">
				{#if emails.length > 0}
					<div class="truncate">
						{#each emails as e}
							<a class="ml-1 text-primary hover:underline" href={`mailto:${e}`}>{e}</a>
						{/each}
					</div>
				{/if}
				{#if phones.length > 0}
					<Separator />
					<div class="truncate">
						{#each phones as p}
							<a class="ml-1 text-primary hover:underline" href={`tel:${p}`}>{p}</a>
						{/each}
					</div>
				{/if}

				{#if websites.length > 0}
					<Separator />
					<div class="truncate">
						{#each websites as w}
							<a
								class="ml-1 break-all text-primary hover:underline"
								href={w}
								target="_blank"
								data-sveltekit-preload-data="off"
								rel="noopener">{cleanWebsite(w)}</a
							>
						{/each}
					</div>
				{/if}
				{#if socials.length > 0}
					<Separator />
					<div>
						{#each socials as s}
							<a
								class="ml-1 break-all text-primary hover:underline"
								href={s}
								data-sveltekit-preload-data="off"
								target="_blank"
								rel="noopener">{s}</a
							>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div
		class="flex w-full flex-col items-center justify-between gap-3 border-t border-border p-4 md:flex-row"
	>
		<Button
			variant="outline"
			href={googleMapsLink(place.latitude, place.longitude)}
			target="_blank"
			class="w-full md:w-auto"
			rel="noopener"
		>
			<ChevronRight class="h-4 w-4 rotate-90" /> Google Maps
		</Button>

		<!-- Continue button goes to place page; parent may also listen to 'continue' event -->
		<Button class="w-full md:w-auto" href={placesPath} target="_blank">Details</Button>
	</div>
</div>
