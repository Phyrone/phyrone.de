import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import { enhancedImages } from "@sveltejs/enhanced-img";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [
		tailwindcss(),
		enhancedImages(),
		sveltekit(),
		paraglideVitePlugin({
			project: "./project.inlang",
			outdir: "./src/lib/paraglide",
			strategy: ["cookie", "url"],
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
	experimental: { hmrPartialAccept: true },
	ssr: { target: "node" },
	html: {},
	json: { stringify: "auto" },
	esbuild: {
		sourcemap: "inline",
		charset: "utf8",
		format: "esm",
	},
});
