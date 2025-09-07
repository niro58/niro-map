<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Button from '$lib/components/ui/button/button.svelte';
	let { children } = $props();
</script>


<nav class="flex items-center justify-between p-4 bg-white shadow-sm">
	<a href="/" class="flex items-center gap-2">
		<img src={favicon} alt="Logo" class="w-6 h-6" />
		<span class="font-semibold">Pop Places</span>
	</a>
	<div class="flex flex-row gap-2">
		<Button variant="outline" href="/">Map</Button>
		<Button variant="outline" href="/about">About</Button>
	</div>
</nav>

{@render children?.()}
