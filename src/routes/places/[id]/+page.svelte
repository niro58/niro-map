<script lang="ts">
	import Map from '$lib/components/map.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Seo from '$lib/components/ui/seo/seo.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { cleanCategory, cleanWebsite, googleMapsLink } from '$lib/utils.js';
	import {
		MapPin,
		Globe,
		Mail,
		Phone,
		Building,
		Info,
		ChevronDown,
		Database
	} from '@lucide/svelte';

	const { data } = $props();

	const place = data.place;

	function formatDate(s: string | Date | undefined) {
		if (!s) return '';
		const d = typeof s === 'string' ? new Date(s) : s;
		return isNaN(d.getTime()) ? String(s) : d.toLocaleString();
	}
	const mapCenterWithOffset = [place.longitude, place.latitude];
</script>

<Seo
	title={`${place['names.primary'] ?? place.id} | Niro Map`}
	description="View detailed information for a specific point of interest, including its category, address, source metadata, and its precise location on the map."
	keywords="place details, point of interest, POI data, location information, coordinates, Overture data, map location, business details, place inspector"
/>

<div class="mx-auto my-8 max-w-6xl space-y-8 p-4">
	<!-- Header Section -->
	<header class="rounded-lg bg-card p-6 shadow-sm">
		<div class="flex flex-col items-start justify-between gap-4 md:flex-row">
			<div class="flex-1">
				<h1 class="text-3xl font-bold text-foreground">{place['names.primary'] ?? place.id}</h1>

				<!-- Categories -->
				<div class="mt-3 flex flex-wrap gap-2">
					{#if place['categories.primary']}
						<Badge>{cleanCategory(place['categories.primary'])}</Badge>
					{/if}
					{#if place['categories.alternate']}
						{#each place['categories.alternate'] as cat}
							<Badge variant="secondary">{cleanCategory(cat)}</Badge>
						{/each}
					{/if}
				</div>

				<!-- Metadata -->
				<div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
					<div class="flex items-center gap-1.5">
						<Info class="h-4 w-4" />
						<span>ID: {place.id}</span>
					</div>
					<span class="hidden sm:inline">•</span>
					<div class="flex items-center gap-1.5">
						<span>Version: {place.version}</span>
					</div>
					<span class="hidden sm:inline">•</span>
					<div class="flex items-center gap-1.5">
						<span>Confidence: {Math.round((place.confidence ?? 0) * 100)}%</span>
					</div>
				</div>
			</div>

			<!-- Coordinates & Map Link -->
			<div class="flex-shrink-0 text-left md:text-right">
				{#if place.latitude != null && place.longitude != null}
					<div class="text-sm font-medium text-muted-foreground">Coordinates</div>
					<a
						class="font-mono text-lg font-medium text-primary hover:underline"
						href={googleMapsLink(place.latitude, place.longitude)}
						target="_blank"
						rel="noopener"
					>
						{place.latitude.toFixed(6)}, {place.longitude.toFixed(6)}
					</a>
					<div class="mt-3">
						<Button
							href={googleMapsLink(place.latitude, place.longitude)}
							target="_blank"
							rel="noopener"
						>
							<MapPin class="mr-2 h-4 w-4" /> Open in Google Maps
						</Button>
					</div>
				{:else}
					<div class="text-sm text-muted-foreground">Coordinates not available</div>
				{/if}
			</div>
		</div>
	</header>

	<!-- Main Content Grid -->
	<main class="grid grid-cols-1 gap-8 lg:grid-cols-5">
		<!-- Left Column -->
		<div class="col-span-1 space-y-8 lg:col-span-2">
			<!-- Contact Card -->
			<section class="rounded-lg bg-card p-6 shadow-sm">
				<h2 class="text-xl font-semibold text-foreground">Contact Information</h2>
				<div class="mt-4 space-y-4">
					<!-- Websites & Socials -->
					<div>
						<h3 class="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
							<Globe class="h-4 w-4" /> Websites & Socials
						</h3>
						<div class="flex flex-col gap-1.5">
							{#if place.websites}
								<a
									href={cleanWebsite(place.websites)}
									target="_blank"
									rel="noopener"
									class="truncate text-primary hover:underline">{cleanWebsite(place.websites)}</a
								>
							{/if}
							{#if place.socials}
								{#each place.socials as s}
									<a
										href={s}
										target="_blank"
										rel="noopener"
										class="truncate text-primary hover:underline">{cleanWebsite(s)}</a
									>
								{/each}
							{/if}
						</div>
					</div>

					<!-- Emails -->
					<div>
						<h3 class="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
							<Mail class="h-4 w-4" /> Emails
						</h3>
						<div class="flex flex-col gap-1.5">
							{#if place.emails && place.emails.length > 0}
								{#each place.emails as e}
									<a href={`mailto:${e}`} class="text-primary hover:underline">{e}</a>
								{/each}
							{/if}
						</div>
					</div>

					<!-- Phones -->
					<div>
						<h3 class="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
							<Phone class="h-4 w-4" /> Phones
						</h3>
						<div class="flex flex-col gap-1.5">
							{#if place.phones && place.phones.length > 0}
								{#each place.phones as p}
									<a href={`tel:${p}`} class="text-primary hover:underline">{p}</a>
								{/each}
							{/if}
						</div>
					</div>
				</div>
			</section>

			<!-- Brand & Source Card -->
			<section class="rounded-lg bg-card p-6 shadow-sm">
				<h2 class="text-xl font-semibold text-foreground">Details</h2>
				<div class="mt-4 space-y-4">
					<div>
						<h3 class="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
							<Building class="h-4 w-4" /> Brand
						</h3>
						<p class="text-foreground">{place['brand.names.primary'] ?? 'Not available'}</p>
					</div>

					<div>
						<h3 class="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
							<Database class="h-4 w-4" /> Data Source
						</h3>
						{#if place.sources}
							{#each place.sources as source, i}
								{#if i > 0}
									<Separator class="my-2" />
								{/if}
								<div class="text-sm">
									<p class="text-muted-foreground italic">{source.property}</p>
									<p class="font-medium text-foreground">Dataset: {source.dataset}</p>
									<p class="text-muted-foreground">Record: {source.record_id}</p>
									<p class="text-muted-foreground">
										Updated: {formatDate(source.update_time)}
									</p>
									<p class="text-muted-foreground">
										Confidence: {Math.round(source.confidence ? source.confidence * 100 : 0)}%
									</p>
								</div>
							{/each}
						{/if}
					</div>
				</div>
			</section>
		</div>

		<!-- Right Column -->
		<div class="col-span-1 lg:col-span-3">
			<section class="rounded-lg bg-card p-6 shadow-sm">
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
									{[addr.locality, addr.region, addr.country, addr.postcode]
										.filter(Boolean)
										.join(', ')}
								</p>
							</div>
						{/each}
					{:else}
						<p class="text-sm text-muted-foreground">No address data available.</p>
					{/if}
				</div>
				<!-- Map -->
				<div
					class="mt-6 aspect-video h-auto w-full overflow-hidden rounded-md border border-border"
				>
					<Map
						actionButtons={false}
						places={{ type: 'SUCCESS', data: [place] }}
						initialZoom={10}
						center={mapCenterWithOffset as [number, number]}
					/>
				</div>
			</section>
		</div>
	</main>

	<!-- Developer Info Section -->
	<footer class="mx-auto max-w-4xl">
		<details class="group rounded-lg border border-border bg-card shadow-sm">
			<summary
				class="flex cursor-pointer list-none items-center justify-between p-4 font-medium text-foreground"
			>
				Developer Info
				<ChevronDown class="h-5 w-5 transition-transform duration-200 group-open:rotate-180" />
			</summary>
			<div class="border-t border-border p-4">
				<pre
					class="overflow-auto rounded bg-muted p-3 text-xs text-muted-foreground">{JSON.stringify(
						place,
						null,
						2
					)}</pre>
			</div>
		</details>
	</footer>
</div>
