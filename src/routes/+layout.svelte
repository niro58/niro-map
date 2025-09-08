<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Button from '$lib/components/ui/button/button.svelte';
	import NiroLogo from '$lib/components/ui/niro-logo.svelte';
	import { page } from '$app/state';
	let { children } = $props();
</script>

<nav class="flex items-center justify-between bg-white p-4 shadow-sm">
	<a href="/" class="flex items-center gap-2">
		<NiroLogo class="h-10 w-10" />
		<span class="font-semibold">Niro Maps</span>
	</a>
	<div class="flex flex-row gap-2">
		<Button variant={page.route.id === '/' ? 'default' : 'outline'} href={`/${page.url.search}`}
			>Map</Button
		>
		<Button
			variant={page.route.id === '/places' ? 'default' : 'outline'}
			href={`/places${page.url.search}`}>Browser</Button
		>
		<Button variant={page.route.id === '/about' ? 'default' : 'outline'} href="/about">About</Button
		>
	</div>
</nav>

{@render children?.()}
