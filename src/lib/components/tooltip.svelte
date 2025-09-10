<script lang="ts">
	import type { PlaceResponse } from '$lib/types';
	import { cleanCategory } from '$lib/utils';

	type Props = {
		place: PlaceResponse;
		width: number;
		height: number;
	};
	let { place, width, height }: Props = $props();
</script>

<div
	class="flex flex-col justify-center rounded-md bg-card px-2 font-sans text-card-foreground shadow-md"
	style="width:{width}px; height:{height}px; font-size:11px;"
>
	<!-- Name and Category -->
	<div class="flex items-center justify-between">
		<span class="truncate font-semibold">{place['names.primary']}</span>
	</div>
	<div class="truncate">
		<span class="text-xs text-muted-foreground">{cleanCategory(place['categories.primary'])}</span>
	</div>

	<!-- Location -->
	{#if place.addresses?.[0]}
		<div class="text-xs text-muted-foreground">
			{place.addresses[0].locality}, {place.addresses[0].country}
		</div>
	{/if}

	<!-- Brand -->
	{#if place['brand.names.primary']}
		<div class="text-xs text-muted-foreground italic">
			{place['brand.names.primary']}
		</div>
	{/if}

	<!-- Confidence Score -->
	<div class="text-[10px] text-muted-foreground">
		Confidence: {Math.round(place.confidence * 100)}%
	</div>
</div>
