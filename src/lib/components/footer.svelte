<script>
	import { appPages } from '$lib/config/pages';
	import NiroLogo from '$ui/niro-logo.svelte';
</script>

<footer class="mt-12 border-t py-4">
	<div class="container flex items-center justify-between">
		<div class="flex items-center gap-3">
			<NiroLogo class="w-8" />
			<span class="text-lg font-semibold">Niro Map</span>
		</div>
		<nav class="flex gap-8">
			<a href={appPages.terms.path()} class="text-base text-primary no-underline hover:underline"
				>Terms</a
			>
		</nav>
	</div>
</footer>
