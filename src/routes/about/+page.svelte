<script lang="ts">
	import * as Card from '$lib/components/ui/card/index';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	const githubUrl = 'https://github.com/niro58/niro-map';
	const kofiUrl = 'https://ko-fi.com/niro58';
</script>

<div class="mx-auto my-8 max-w-4xl space-y-6 p-4">
	<Card.Root>
		<Card.Header>
			<Card.Title>Pop Places Map</Card.Title>
			<Card.Description>
				Map visualizer of popular places — a small weekend project for fun
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<p class="mb-3 text-sm text-muted-foreground">
				This project visualizes popular points-of-interest from Overture maps places and lets you
				explore, filter and inspect places on an interactive map, or a signular page of that place.
                In total there are ~12 million places from all around the world.
			</p>
			<p class="mb-3 text-sm text-muted-foreground">
				For now it was just a fun weeked project, so many things are done in a quick way, some
				things might be broken, idk, contact if found any.
			</p>

			<Separator />

			<h4 class="mt-4 mb-2 font-medium">What you can do</h4>
			<ul class="list-inside list-disc space-y-1 text-sm text-muted-foreground">
				<li>Explore places by category and country</li>
				<li>Inspect place details and source metadata</li>
				<li>Place a pinned area and search by radius</li>
				<li>Check that place at google maps based on location</li>
			</ul>
			<h4 class="mt-4 mb-2 font-medium">Upcoming Features</h4>
			<ul class="list-inside list-disc space-y-1 text-sm text-muted-foreground">
				<li>
					Browse Places View - A dedicated page to explore places in a list format with pagination
				</li>
				<li>Places export to CSV format</li>
				<li>Responsive mobile view, didn't look at that at all</li>
				<li>
					Optimization of points, atm its just sending all the points in a single batch, maybe
					streaming?
				</li>
			</ul>

			<Separator class="my-4" />

			<h4 class="mb-2 font-medium">Project Costs</h4>
			<p class="mb-4 text-sm text-muted-foreground">
				This project is completely free to use. However, there are ongoing costs to maintain it:
			</p>
			<ul class="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
				<li>Database hosting: ~$20/month</li>
				<li>Domain and hosting: 0, self-hosted on my own VPS</li>
				<li>Hosting: 0, self-hosting on my VPS</li>
				<li>Domain: ~$15/year</li>
				<li>Data sources: free/open data</li>
				<li>Development time and maintenance</li>
			</ul>

			<Separator class="my-4" />

			<h4 class="mb-2 font-medium">Tech & Data</h4>
			<p class="text-sm text-muted-foreground">
				Frontend: Svelte + Tailwind + Shadcn. Map: Maplibre, @arenarium/maps for points. Backend:
				Postgres/PostGIS hosted on Supabase.
			</p>
		</Card.Content>

		<Card.Footer class="flex flex-col gap-3">
			<div class="flex gap-2">
				<Button href={kofiUrl} target="_blank" rel="noopener">Support the project</Button>
				<Button variant="outline" href={githubUrl} target="_blank" rel="noopener"
					>View on GitHub</Button
				>
			</div>

			<div class="text-xs text-muted-foreground">
				If you'd like me to focus more time on this project, supporting it (even a small amount)
				helps prioritize features, data improvements and maintenance.
			</div>
		</Card.Footer>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>
				<div class="text-sm font-medium">Contact & Contribute</div>
			</Card.Title>
		</Card.Header>

		<Card.Content>
			<p class="mb-4 text-sm text-muted-foreground">
				If you find bugs, have dataset suggestions, want a feature or just want to contact me.
			</p>

			<p class="mb-4 text-sm text-muted-foreground">
				Want to contribute? The project is open source! Check out the
				<a href={githubUrl} target="_blank" rel="noopener" class="text-primary hover:underline">
					GitHub repository
				</a>
			</p>

			<span class="text-sm">
				Email: <a href="mailto:niro.dev.01@gmail.com" class="text-primary hover:underline">
					niro.dev.01@gmail.com
				</a>
			</span>
		</Card.Content>
		<Card.Footer>
			<span>Latest DB update: <Badge variant="secondary">07.09.2025</Badge></span>
		</Card.Footer>
	</Card.Root>
</div>
