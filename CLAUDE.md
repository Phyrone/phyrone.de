# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal homepage/blog (phyrone.de) — SvelteKit 2 + Svelte 5 (runes), TypeScript, Tailwind 4 + DaisyUI, prerendered and deployed to Cloudflare Pages.

Package manager is **pnpm** (`engine-strict=true`). Use `pnpm`, not npm/yarn.

## Commands

```bash
pnpm dev              # vite dev server
pnpm build            # production build (also regenerates paraglide + content-collections)
pnpm preview          # serve the build
pnpm check            # svelte-kit sync && svelte-check (typecheck)
pnpm lint             # prettier --check && eslint
pnpm fix              # prettier --write && eslint --fix
pnpm test             # unit (once) + e2e
pnpm test:unit        # vitest watch
pnpm test:e2e         # playwright install && playwright test
```

Single test runs:

```bash
pnpm vitest run --project=server src/lib/foo.test.ts
```

```bash
pnpm vitest run --project=client src/lib/Foo.svelte.test.ts
```

```bash
pnpm playwright test e2e/foo.e2e.ts
```

Vitest is split into two projects (`vite.config.ts`): **client** runs `*.svelte.{test,spec}.ts` in a headless Chromium browser via `@vitest/browser-playwright`; **server** runs the remaining `*.{test,spec}.ts` in node. `expect.requireAssertions` is on — every test must assert. Playwright only picks up `**/*.e2e.{ts,js}` and boots its own `build && preview` on port 4173. No tests exist yet; the harness was added but is unused.

## Content pipeline (the non-obvious part)

Blog posts live in `posts/` as `.md` and go through **two independent systems** that must stay in sync:

1. **Metadata** — `content-collections.ts` parses frontmatter only (zod schema `PostMetadata`) and emits `$content` (`.content-collections/generated`, gitignored). Missing frontmatter is backfilled from the file path: `ARTICLE_DATA_EXTRACT_PATTERN` pulls `year/month/day/slug` out of paths like `posts/2024/01/04/my-post.md` or `posts/2024/test.md`. Dates are parsed with moment using German-style formats (`DD.MM.YYYY HH:mm:ss`, etc.). Frontmatter wins over path.
2. **Rendering** — mdsvex (configured in `svelte.config.js`) compiles the same files as Svelte components, loaded lazily via `import.meta.glob` in `src/lib/posts.ts` (`load_blog_post_component`). The mdsvex layout is `src/lib/layouts/default/root.svelte`, which maps markdown elements to the `c-h1.svelte`/`c-p.svelte`/… components exported from its module script.

`src/lib/posts.ts` builds `pathIndexedPosts` (a `year → month → day → slug → Post` nested map) at import time; the blog route `+page.ts` looks posts up through it. `post_to_url` is the canonical way to build post URLs. Most of `posts.ts` is commented-out legacy of an earlier glob-based approach — ignore it.

Code blocks are highlighted at build time with Shiki (`nord` theme, all bundled languages) and wrapped in a DaisyUI `mockup-code` div.

Relative images inside markdown are rewritten by `md-images.js` (a remark plugin) into `import` statements with `?enhanced`, so `@sveltejs/enhanced-img` processes them. `src/lib/images.ts` (`get_image`) resolves a post-relative path (e.g. a `thumbnail:` frontmatter value) against the eager glob of `src/assets/**` and `posts/**`.

## i18n

Paraglide JS (`@inlang/paraglide-js`). Source language is **de** and it is currently the only locale. Messages live in `messages/de.json` (inlang message-format). The generated runtime at `src/lib/paraglide/` (alias `$paraglide`) is **gitignored** — it only exists after a `dev`/`build`, so imports from it will look broken on a clean checkout until you run one.

Locale resolution uses the `url` strategy; `src/hooks.ts` de-localizes URLs via `reroute`, and `src/lib/server/server_html.ts` wraps `paraglideMiddleware` to set `<html lang>` on the transformed page chunk (parsing the HTML with `node-html-parser`).

## Routing & rendering

Everything is prerendered (`src/routes/+layout.ts`: `prerender = true`, `ssr = true`, `trailingSlash = 'never'`). `prerender.handleUnseenRoutes: 'fail'` in `svelte.config.js` — a route not reachable by the crawler fails the build; non-linked endpoints must be added to `prerender.entries` (as the `/.well-known/matrix/*` routes are). The `[x+2e]well-known` directory name is SvelteKit's escape for a leading dot.

Routes sit under the `(app)` group, which wraps children in `AppSkeleton.svelte` (sidebar, theme switch).

## Deploy targets

`svelte.config.js` currently uses `adapter-cloudflare` with `fallback: 'spa'`; `adapter-node` and `adapter-static` are installed and kept commented out next to it. CI (`.github/workflows/build.yaml`) builds on every push and runs `wrangler pages deploy` (config in `wrangler.jsonc`, project `phyrone`). The `Dockerfile` and `pnpm prod` assume the **node** adapter (`dist/index.js`) — switching the adapter is required before either works.

## Conventions

Prettier: tabs, single quotes, no trailing commas, 100 cols, with the svelte and tailwind plugins. Run `pnpm fix` before finishing. ESLint has `no-explicit-any` and `ban-ts-comment` disabled.

Path aliases (defined in `svelte.config.js`, not tsconfig): `$lib`, `$styles`, `$assets`, `$posts`, `$components`, `$paraglide`, `$content`.

Svelte 5 runes only (`$props`, `$state`) — no `export let`. DaisyUI theme is `coffee`, configured in `src/app.css` via Tailwind 4's CSS-first `@plugin` syntax (there is no `tailwind.config.js`). Runtime input validation uses zod.
