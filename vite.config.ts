import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import { searchForWorkspaceRoot } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import tailwindcss from '@tailwindcss/vite';
import contentCollections from '@content-collections/vite';

export default defineConfig({
	plugins: [
		tailwindcss({ optimize: true }),
		enhancedImages(),
		sveltekit(),
		contentCollections(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['url', 'baseLocale']
		})
	],
	server: { fs: { allow: [searchForWorkspaceRoot(process.cwd())] } },
	build: {
		minify: 'terser',
		cssMinify: 'lightningcss',
		cssCodeSplit: true,
		sourcemap: true
	},
	experimental: { hmrPartialAccept: true },
	ssr: { target: 'node' },
	html: {},
	json: { stringify: 'auto' },
	esbuild: { sourcemap: 'inline', charset: 'utf8', format: 'esm' },
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
