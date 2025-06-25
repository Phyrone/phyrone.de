import { paraglide } from "@inlang/paraglide-sveltekit/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import { enhancedImages } from "@sveltejs/enhanced-img";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [
		tailwindcss(),
		enhancedImages(),
		sveltekit(),
		paraglide({
			project: "./project.inlang",
			outdir: "./src/lib/paraglide",
		}),
	],
	server: {
		fs: {
			allow: [searchForWorkspaceRoot(process.cwd())],
		},
	},
	build: {
		minify: "terser",
		cssMinify: "lightningcss",
		cssCodeSplit: true,
		sourcemap: true,
	},
	experimental:{
		hmrPartialAccept: true,
	},
	ssr:{
		target: "node",
	},
	html:{

	},
	json:{
		stringify: 'auto',
	},
	esbuild:{
		sourcemap:  "inline",
		charset: "utf8",
		format: "esm"
	}
});
