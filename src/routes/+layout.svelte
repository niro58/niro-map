<script lang="ts">
	import '../app.css';

	import Nav from '$lib/components/nav.svelte';
	import Footer from '$lib/components/footer.svelte';
	let { children, data } = $props();
</script>

<div class="flex min-h-screen flex-col">
	<Nav />

	<div class="flex min-h-0 flex-1 flex-col">
		{@render children?.()}
	</div>
	{#if !data.page.withoutFooter}
		<Footer />
	{/if}
</div>
