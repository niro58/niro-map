<script lang="ts">
	import '../app.css';

	import Nav from '$lib/components/nav.svelte';
	let { children } = $props();
</script>

<div class="flex h-screen flex-col">
	<Nav />

	{@render children?.()}
</div>
