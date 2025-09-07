<script module lang="ts">
	export type SeoProps = {
		title?: string;
		description?: string;
		keywords?: string;
		base?: string;
		applicationName?: string;
		themeColor?: string;
		nofollow?: boolean;
		noindex?: boolean;
		nositelinkssearchbox?: boolean;
		notranslate?: boolean;
		canonical?: string;
		amp?: string;
		manifest?: string;
		languageAlternates?: { href: string; hreflang: string }[];
		twitter?: Record<string, string>;
		openGraph?: Record<string, any>;
		facebook?: { appId: string };
		jsonLd?: Record<string, any>;
		type?: string;
		imageWidth?: number;
		imageHeight?: number;
		children?: Snippet;
	};
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import OpenGraph from './open-graph.svelte';

	let {
		title,
		description,
		keywords,
		base,
		applicationName,
		themeColor,
		nofollow,
		noindex,
		nositelinkssearchbox,
		notranslate,
		canonical,
		amp,
		manifest,
		languageAlternates,
		twitter,
		openGraph,
		facebook,
		jsonLd,
		type,
		imageWidth,
		imageHeight,
		children
	}: SeoProps = $props();
</script>

<svelte:head>
	{#if title}
		<title>{title}</title>
		<meta property="og:title" content={title} />
		<meta name="twitter:title" content={title} />
	{/if}
	{#if type}
		<meta property="og:type" content={type} />
	{/if}

	{#if imageWidth}
		<meta property="og:image:width" content={imageWidth.toString()} />
	{/if}
	{#if imageHeight}
		<meta property="og:image:height" content={imageHeight.toString()} />
	{/if}

	{#if description}
		<meta data-key="description" name="description" content={description} />
		<meta property="og:description" content={description} />
		<meta name="twitter:description" content={description} />
	{/if}

	{#if canonical}
		<link rel="canonical" href={canonical} />
		<meta property="og:url" content={canonical} />
		<meta name="twitter:url" content={canonical} />
	{/if}

	{#if keywords}
		<meta name="keywords" content={keywords} />
	{/if}

	{#if amp}
		<link rel="amphtml" href={amp} />
	{/if}

	{#if manifest}
		<link rel="manifest" href={manifest} />
	{/if}

	{#if applicationName}
		<meta name="application-name" content={applicationName} />
	{/if}

	{#if languageAlternates}
		{#each languageAlternates as { href, hreflang }}
			<link rel="alternate" {href} {hreflang} />
		{/each}
	{/if}

	{#if themeColor}
		<meta name="theme-color" content={themeColor} />
	{/if}

	{#if base}
		<base href={base} />
	{/if}

	{#if facebook?.appId}
		<meta property="fb:app_id" content={facebook.appId} />
	{/if}

	<meta
		name="robots"
		content={`${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`}
	/>
	<meta
		name="googlebot"
		content={`${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`}
	/>

	{#if nositelinkssearchbox}
		<meta name="google" content="nositelinkssearchbox" />
	{/if}

	{#if notranslate}
		<meta name="google" content="notranslate" />
	{/if}

	{#if twitter}
		{#each Object.entries(twitter) as [key, value]}
			{@const transformed = key.replace(/([a-z])([A-Z])/g, '$1:$2').toLowerCase()}
			<!-- The `transformed` variable changes eg, twitter.title into twitter:title
                  It loops over all the properties and changes the '.' into ':'
              -->
			<meta name="twitter:{transformed}" content={value} />
		{/each}
	{/if}

	{#if openGraph}
		<OpenGraph {openGraph} />
	{/if}

	{#if jsonLd}
		{@html `<script type="application/ld+json">${JSON.stringify(jsonLd) + '<'}/script>`}
	{/if}

	{@render children?.()}
</svelte:head>
