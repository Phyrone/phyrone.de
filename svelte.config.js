import { mdsvex, escapeSvelte } from 'mdsvex';
import adapter_cloudflare from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createHighlighter, bundledLanguages } from 'shiki';
import relativeEnhancedImages from './md-images.js';
import { resolve } from 'node:path';

/** @type {import('shiki').BuiltinTheme} **/
const theme = 'nord';
const langs = Object.keys(bundledLanguages);
const highlighter = await createHighlighter({
	themes: [theme],
	langs
});
const mdsvex_extensions = ['.svx', '.md'];

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [
		vitePreprocess(),
		//TODO outsource mdsvex config into a seperate file
		mdsvex({
			extensions: mdsvex_extensions,
			layout: resolve('./src/lib/layouts/default/root.svelte'),
			remarkPlugins: [relativeEnhancedImages],
			smartypants: true,
			highlight: {
				highlighter: async (code, lang = 'text') => {
					const html = escapeSvelte(
						highlighter.codeToHtml(code, {
							lang,
							theme,
							structure: 'classic',
							colorReplacements: {},
							meta: {
								'data-code-lang': lang,
								'data-code': code
							}
						})
					);
					return `<div class="mockup-code">{@html \`${html}\` }</div>`;
				}
			}
		})
	],
	compilerOptions: {
		preserveComments: false,
		preserveWhitespace: false
	},
	kit: {
		adapter: adapter_cloudflare({
			fallback: 'spa'
		}),
		// Enforcing rather than report-only: report-only CSP can only be
		// delivered as an HTTP header, never via <meta http-equiv>, and this
		// site is fully prerendered with no server to set headers. Every route
		// was walked in a browser before this was switched on.
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self'],
				'style-src': ['self', 'unsafe-inline'],
				'img-src': ['self', 'data:', 'blob:'],
				'font-src': ['self'],
				'connect-src': ['self'],
				'frame-src': ['https://www.youtube-nocookie.com'],
				'object-src': ['none'],
				'base-uri': ['self'],
				'form-action': ['self']
			}
		},
		alias: {
			$lib: 'src/lib',
			$styles: 'src/styles',
			$assets: 'src/assets',
			$posts: 'src/posts',
			$components: 'src/components',
			$paraglide: 'src/lib/paraglide',
			$content: './.content-collections/generated'
		},
		inlineStyleThreshold: 1024,
		paths: {
			relative: false
		},
		prerender: {
			concurrency: 16,
			handleUnseenRoutes: 'fail',
			entries: ['*', '/.well-known/matrix/server', '/.well-known/matrix/client']
		}
	},

	extensions: ['.svelte', ...mdsvex_extensions]
};

export default config;
