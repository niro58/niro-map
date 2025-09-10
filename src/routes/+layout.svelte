<script lang="ts">
	import '../app.css';

	import Nav from '$lib/components/nav.svelte';
	let { children } = $props();
</script>

<Nav />

{@render children?.()}
