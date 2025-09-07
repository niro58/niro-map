<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Button from '$lib/components/ui/button/button.svelte';
	import NiroLogo from '$lib/components/ui/niro-logo.svelte';
	let { children } = $props();
</script>

<nav class="flex items-center justify-between bg-white p-4 shadow-sm">
	<a href="/" class="flex items-center gap-2">
		<NiroLogo class="h-10 w-10" />
		<span class="font-semibold">Niro Maps</span>
	</a>
	<div class="flex flex-row gap-2">
		<Button variant="outline" href="/">Map</Button>
		<Button variant="outline" href="/about">About</Button>
	</div>
</nav>

{@render children?.()}
