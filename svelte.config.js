import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		alias: {
			$config: './src/config',
			$modules: './src/lib/modules',
			$ui: './src/lib/components/ui'
		},
		adapter: adapter({
			out: 'build'
		}),
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self', 'https://plausible.io', 'https://*.plausible.io', 'blob:'],
				'style-src': ['self', 'unsafe-inline'],
				'img-src': ['self', 'data:'],
				'font-src': ['self'],
				'connect-src': [
					'self',
					'https://plausible.io',
					'https://*.plausible.io',
					'https://tiles.openfreemap.org',
					'https://maps.api.arenarium.dev'
				],
				'object-src': ['none']
			}
		}
	}
};

export default config;
