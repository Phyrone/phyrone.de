import { mdsvex, escapeSvelte } from 'mdsvex';
import adapter_node from '@sveltejs/adapter-node';
import adapter_static from '@sveltejs/adapter-static';
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
const sv_md_exteions = ['.svx', '.svelte.md'];

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [
		vitePreprocess(),
		//TODO outsource mdsvex config into a seperate file
		mdsvex({
			extensions: sv_md_exteions,
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
					//console.log(html);
					return `<div class="mockup-code">{@html \`${html}\` }</div>`;
				}
			}
		})
	],
	compilerOptions: {
		preserveComments: false,
		preserveWhitespace: false
	},
	vitePlugin: {
		experimental: {}
	},
	kit: {
		adapter: adapter_cloudflare({ fallback: 'spa' }),
		/*
		adapter: adapter_node({ out: 'dist', precompress: true }),
		adapter: adapter_static({
			pages: 'dist',
			assets: 'dist',
			fallback: '404.html',
			precompress: true,
			strict: true
		}),
		 */
		alias: {
			$lib: 'src/lib',
			$styles: 'src/styles',
			$assets: 'src/assets',
			$posts: 'src/posts',
			$components: 'src/components',
			$paraglide: 'src/lib/paraglide'
		},
		inlineStyleThreshold: 256,
		paths: {
			relative: false
		},
		prerender: {
			concurrency: 16
		}
	},

	extensions: ['.svelte', ...sv_md_exteions]
};

export default config;
