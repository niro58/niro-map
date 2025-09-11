<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import NiroLogo from './ui/niro-logo.svelte';
	import { page } from '$app/state';
	import Card from './ui/card/card.svelte';
	import Button from './ui/button/button.svelte';
	import { Filter, Menu, X } from '@lucide/svelte';
	import { isFilterOpen } from '$lib/store';

	let isOpen = $state(false);

	const components = [
		{
			label: 'Home',
			path: () => '/'
		},
		{
			label: 'Browse Places',
			path: () => '/places'
		},
		{
			label: 'About',
			path: () => '/about'
		}
	] as const;
</script>

{#snippet pageLinks()}
	<div in:fade={{ duration: 300, delay: 200 }} class="gap-5 sm:flex sm:flex-row">
		{#each components as item, index}
			{@const path =
				item.path().endsWith('/') && item.path().length > 1
					? item.path().slice(0, -1)
					: item.path()}
			<a
				class={`h-[30px] cursor-pointer px-3 py-2 transition-colors duration-300 ${
					page.url.pathname === path
						? 'font-semibold text-primary hover:text-primary/80'
						: 'text-foreground/80 hover:text-primary/80'
				}`}
				onclick={(e) => {
					isOpen = false;
				}}
				href={path}
			>
				<div
					transition:fade={{ duration: 300, delay: 10000 + 100 * index }}
					class="flex h-full items-center justify-center text-sm leading-5 font-[var(--www-mattmannucci-me-geist-regular-font-family)] whitespace-nowrap"
				>
					{item.label}
				</div>
			</a>
		{/each}
	</div>
{/snippet}
<header class="sticky top-0 z-[999999999] w-full bg-card">
	<div class="flex justify-center">
		<Card
			class="relative container hidden h-[75px] w-full items-center justify-center rounded-t-none border-none shadow-none sm:flex sm:flex-row sm:justify-between"
		>
			<div class=" items-center space-x-3">
				<a href="/" aria-label="Home" class="flex flex-row items-end gap-2 text-xl font-semibold">
					<NiroLogo class="h-full w-8" />
					<span class="hidden text-lg md:block">Niro Map</span>
				</a>
			</div>

			<nav class="flex items-center space-x-8 place-self-center">
				{@render pageLinks()}
			</nav>
		</Card>
		<div class="relative flex w-full items-center justify-between px-4 py-4 sm:hidden">
			<div class="flex w-full flex-row justify-between">
				<Button
					variant="outline"
					size="icon"
					onclick={() => (isOpen = !isOpen)}
					aria-label={isOpen ? 'Close menu' : 'Open menu'}
				>
					{#if isOpen}
						<X class="h-6 w-6" />
					{:else}
						<Menu class="h-6 w-6" />
					{/if}
				</Button>
				<Button
					variant="outline"
					size="icon"
					onclick={() => {
						$isFilterOpen = !$isFilterOpen;
						console.log($isFilterOpen);
						isOpen = false;
					}}
					aria-label={$isFilterOpen ? 'Close filter' : 'Open filter'}
				>
					{#if $isFilterOpen}
						<X class="h-6 w-6" />
					{:else}
						<Filter class="h-6 w-6" />
					{/if}
				</Button>
			</div>
			{#if isOpen}
				<div
					class="absolute top-16 left-0 w-full rounded-b-lg bg-background px-4 pb-4 shadow-lg sm:hidden"
					in:slide={{ duration: 300 }}
					out:slide={{ duration: 300 }}
				>
					{@render pageLinks()}
				</div>
			{/if}
		</div>
	</div>
</header>
