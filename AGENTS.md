# AGENTS.md/CLAUDE.md

## Project

Personal homepage/blog (phyrone.de) — SvelteKit 2 + Svelte 5 (runes), TypeScript, Tailwind 4 + DaisyUI, prerendered and deployed to Cloudflare Pages. `CLAUDE.md` and `GEMINI.md` are symlinks to this file.

Package manager is **pnpm** (`.npmrc`: `engine-strict=true`). Use `pnpm`, not npm/yarn. There is no `src/posts` directory — blog posts live in root `posts/`.

## Commands

```bash
pnpm dev            # vite dev (also generates $paraglide + content-collections)
pnpm build          # production build; regenerates paraglide + content-collections
pnpm preview        # serve the build
pnpm check          # svelte-kit sync && svelte-check (typecheck)
pnpm lint           # prettier --check . && eslint .
pnpm fix            # prettier --write . && eslint . --fix  (run before finishing)
pnpm test           # vitest run + playwright e2e (via npm scripts internally)
pnpm test:unit      # vitest (watch)
pnpm test:e2e       # playwright install && playwright test
pnpm prod           # build + run dist/index.js with deno (requires the node adapter)
```

Single tests:

```bash
pnpm vitest run --project=server src/lib/foo.test.ts
pnpm vitest run --project=client src/lib/Foo.svelte.test.ts
pnpm playwright test e2e/foo.e2e.ts
```

Vitest is split into two projects (`vite.config.ts`): **client** runs `*.svelte.{test,spec}.{js,ts}` in headless Chromium via `@vitest/browser-playwright`; **server** runs the remaining `*.{test,spec}.{js,ts}` in node. `expect.requireAssertions` is on — every test must assert. Playwright (`playwright.config.ts`) only picks up `**/*.e2e.{ts,js}` and boots its own `npm run build && npm run preview` on port 4173. No test files exist yet; the harness is configured but unused. `pnpm test` shells out to `npm run` internally, so prefer `pnpm vitest` / `pnpm playwright` directly.

## Content pipeline (the non-obvious part)

Blog posts live in `posts/` as `.md` and go through **two independent systems** that must stay in sync:

1. **Metadata** — `content-collections.ts` uses the `frontmatter-only` parser (`include: '**/*.md'`, zod schema `PostMetadata`, which `.partial()`s `slug`, `title`, `description`, `date`, `thumbnail`, `tags`) and emits `$content` (`.content-collections/generated`, gitignored). Missing values are backfilled from the file path: `ARTICLE_DATA_EXTRACT_PATTERN` pulls `year/month/day/slug` out of paths like `posts/2024/01/04/my-post.md` or `posts/2024/test.md`, and `date_if_blog_post` merges those into the frontmatter date. Dates are parsed with moment using German-style formats (`DATE_INPUT_FORMATS`: `DD.MM.YYYY`, `DD.MM.YYYY HH:mm:ss`, `YYYY-MM-DD`, …). Frontmatter wins over path. The transform emits `_file`, `_id` (`YYYY-MM-DD-slug`), `slug`, `date`, `description`, `tags`, `thumbnail`, `title` (falls back to slug), `_path`.
2. **Rendering** — mdsvex (configured in `svelte.config.js`) compiles the same files as Svelte components, loaded lazily via the `import.meta.glob('/posts/**/*.{svx,md}')` in `src/lib/posts.ts` (`load_blog_post_component`, which builds `'/posts/' + post._file`). The mdsvex layout is `src/lib/layouts/default/root.svelte`, which maps markdown elements to the `c-h1.svelte`/`c-p.svelte`/… components exported from its module script.

`src/lib/posts.ts` builds `pathIndexedPosts` (`year → month → day → slug → Post`) at import time; the blog route `+page.ts` looks posts up through it. `post_to_url` is the canonical way to build post URLs (uses `resolve('/(app)/blog/[year]/[month]/[day]/[slug]', …)`). Most of `posts.ts` is commented-out legacy of an earlier glob-based approach — ignore it.

Code blocks are highlighted at build time with Shiki (`nord` theme, all bundled languages) and wrapped in a DaisyUI `mockup-code` div.

Relative images inside markdown are rewritten by `md-images.js` (a remark plugin) into `import` statements with `?enhanced`, so `@sveltejs/enhanced-img` processes them. `src/lib/images.ts` (`get_image`) resolves a post-relative path (e.g. a `thumbnail:` frontmatter value) against the eager glob of `src/assets/**` and `posts/**`.

## i18n

Paraglide JS (`@inlang/paraglide-js`, configured in `vite.config.ts` with `strategy: ['url', 'baseLocale']`). Source language is **de** and it is currently the only locale. Messages live in `messages/de.json` (inlang message-format); the project lives in `project.inlang/`. The generated runtime at `src/lib/paraglide/` (alias `$paraglide`) is **gitignored** — it only exists after a `dev`/`build`, so imports from it look broken on a clean checkout until you run one.

Locale resolution uses the `url` strategy; `src/hooks.ts` de-localizes URLs via `reroute` + `deLocalizeUrl`, and `src/lib/server/server_html.ts` wraps `paraglideMiddleware` (chained in `src/hooks.server.ts`) to set `<html lang>` on the transformed page chunk by parsing the HTML with `node-html-parser`.

## Routing & rendering

Everything is prerendered (`src/routes/+layout.ts`: `prerender = true`, `ssr = true`, `trailingSlash = 'never'`). `svelte.config.js` sets `prerender.handleUnseenRoutes: 'fail'` and `entries: ['*', '/.well-known/matrix/server', '/.well-known/matrix/client']` — a route not reachable by the crawler fails the build unless listed as an entry. The `[x+2e]well-known` directory name is SvelteKit's escape for a leading dot. `/health` opts out with `export const prerender = false`.

Routes sit under the `(app)` group, which wraps children in `AppSkeleton.svelte` (sidebar, theme switch).

## Deploy targets

`svelte.config.js` currently uses `adapter-cloudflare` with `fallback: 'spa'`; `adapter-node` and `adapter-static` are installed and kept commented out next to it. CI (`.github/workflows/build.yaml`) builds on **every push** and runs `wrangler pages deploy` via `cloudflare/wrangler-action` (config in `wrangler.jsonc`, project `phyrone`, output `.svelte-kit/cloudflare`). The `Dockerfile` (runs `node dist/index.js`) and `pnpm prod` (runs deno on `dist/index.js`) both assume the **node** adapter — switching the adapter is required before either works.

## Conventions

- Prettier: tabs, single quotes, no trailing commas, 100 cols, with the svelte and tailwind plugins (`.prettierrc`). ESLint has `no-explicit-any` and `ban-ts-comment` disabled.
- Svelte 5 runes only (`$props`, `$state`) — no `export let`.
- DaisyUI is configured via Tailwind 4's CSS-first `@plugin` syntax (there is no `tailwind.config.js`).
- Runtime input validation uses zod.
- Path aliases (defined in `svelte.config.js`, not `tsconfig.json`): `$lib`, `$styles`, `$assets`, `$posts`, `$components`, `$paraglide`, `$content` (`.content-collections/generated`). Use `post_to_url` for post URLs; relative markdown images are rewritten by `md-images.js`.

## Gotchas

- **Generated code is gitignored.** `$paraglide` (`src/lib/paraglide`) and `$content` (`.content-collections/generated`) only exist after a `dev`/`build`. On a clean checkout those imports resolve only after running one.
- **Two independent blog systems must stay in sync.** `content-collections.ts` (frontmatter metadata → `$content`) and mdsvex via `import.meta.glob` in `src/lib/posts.ts` (rendering). Both read `posts/`; changing frontmatter or paths can affect one without the other.
- **`$posts` alias points at `src/posts`, which does not exist.** Blog posts live in root `posts/`. The alias is unused/misleading — use relative paths or the `/posts/**` glob.
- **All routes `prerender`.** An unlinked route breaks the build unless added to `prerender.entries` in `svelte.config.js`; `/health` opts out with `export const prerender = false`.
- **Adapter mismatch is intentional.** `svelte.config.js` uses `adapter-cloudflare` (`fallback: 'spa'`); `adapter-node`/`adapter-static` are commented out. `Dockerfile` and `pnpm prod` assume the node adapter and will not work until it is switched.
- **Path aliases live in `svelte.config.js`, not `tsconfig.json`.** `tsconfig.json` only extends `.svelte-kit/tsconfig.json`.
- Svelte tooling is configured in `.mcp.json` (Claude Code format) and `.opencode/opencode.json` (`@sveltejs/opencode` plugin).

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
