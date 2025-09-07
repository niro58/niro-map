<script lang="ts">
    import * as Card from '$lib/components/ui/card/index';
    import Button from '$lib/components/ui/button/button.svelte';
    import Badge from '$lib/components/ui/badge/badge.svelte';
    import Separator from '$lib/components/ui/separator/separator.svelte';

</script>

<div class="mx-auto my-8 max-w-4xl p-4 space-y-6">
    <Card.Root>
       <Card.Header>
         <Card.Title >
            Pop Places Map
        </Card.Title>
        <Card.Description>
            Map visualizer of popular places — a small weekend project for fun
            </Card.Description>
            </Card.Header>
        <Card.Content>
            <p class="mb-3 text-sm text-muted-foreground">
            This project visualizes popular points-of-interest from GeoParquet/GeoJSON sources and lets you explore,
            filter and inspect places on an interactive map. It uses a lightweight map stack, server-side queries and
            a simple UI to make browsing lots of places fast.
            </p>

            <Separator />

            <h4 class="mt-4 mb-2 font-medium">What you can do</h4>
            <ul class="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Explore popular places by category and country</li>
            <li>Inspect place details and source metadata</li>
            <li>Place a pinned area and search by radius</li>
            <li>Export or inspect data loaded from GeoParquet -> PostgreSQL</li>
            </ul>

            <Separator class="my-4" />

            <h4 class="mb-2 font-medium">Project Costs</h4>
            <p class="text-sm text-muted-foreground mb-4">
                This project is completely free to use. However, there are ongoing costs to maintain it:
                <ul class="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-2">
                    <li>Database hosting: ~$20/month</li>
                    <li>Domain and hosting: 0, self-hosted on my own VPS</li>
                    <li>Hosting: 0, self-hosting on my VPS</li>
                    <li>Domain: ~$15/year</li>
                    <li>Data sources: free/open data</li>
                    <li>Development time and maintenance</li>
                </ul>
            </p>

            <Separator class="my-4" />

            <h4 class="mb-2 font-medium">Tech & Data</h4>
            <p class="text-sm text-muted-foreground">
            Frontend: Svelte + Tailwind + Shadcn. Map: Maplibre, @arenarium/maps for points. Backend: Postgres/PostGIS hosted on Supabase.
            </p>
        </Card.Content>

        <Card.Footer class="flex flex-col gap-3">
            <div class="flex gap-2">
        
                <a href={"https://ko-fi.com/niro58"} target="_blank" rel="noopener">
                    <Button>Support the project</Button>
                </a>
            </div>

            <div class="text-xs text-muted-foreground">
                If you'd like me to focus more time on this project, supporting it (even a small amount) helps prioritize
                features, data improvements and maintenance.
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
            <p class="text-sm text-muted-foreground mb-4">
                If you find bugs, have dataset suggestions, want a feature or just want to contact me.
            </p>

            <p class="text-sm text-muted-foreground mb-4">
                Want to contribute? The project is open source! Check out the 
                <a href="https://github.com/yourusername/pop-places-map" class="text-primary hover:underline">
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
            <span>Latest DB update: <Badge variant="secondary">2024-06-10</Badge></span>
        </Card.Footer>
    </Card.Root>
</div>