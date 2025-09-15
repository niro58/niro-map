<script lang="ts">
	import { appPages } from '$lib/config/pages';
	import Button from '$ui/button/button.svelte';
	import * as Card from '$ui/card/index';

	const terms = [appPages.terms_privacy_policy, appPages.terms_terms_of_service];
</script>

<div class="container py-12">
	{#each terms as term}
		<Card.Card class="mb-4">
			<Card.Content>
				<h2 class="mb-2 text-2xl font-bold">{term.name}</h2>
				<Button href={term.path()}>Read More</Button>
			</Card.Content>
		</Card.Card>
	{/each}
</div>
