# phyrone.de

Personal homepage and blog. SvelteKit 2 + Svelte 5 (runes), TypeScript, Tailwind 4 + DaisyUI,
prerendered and deployed to Cloudflare Pages.

## Prerequisites

- Node `^24` — enforced, not advisory, because `.npmrc` sets `engine-strict=true`. Installs fail on
  a mismatched version. The range lives in `engines.node` and is the single source of truth: CI
  reads it too, via `node-version-file: package.json`.
- pnpm — the version is pinned in `packageManager`; `corepack enable` will honour it. Never use
  npm or yarn here.

## A clean checkout looks broken until you build

Two directories are generated and gitignored:

- `src/lib/paraglide/` — the Paraglide i18n runtime, aliased `$paraglide`
- `.content-collections/generated` — post metadata, aliased `$content`

Neither exists until the first `pnpm dev` or `pnpm build`, and `svelte-kit sync` does **not**
produce them. So on a fresh clone:

```
pnpm check   →  16 "Cannot find module" errors for $content and $lib/paraglide/*
```

That is expected, not a broken checkout. **Run `pnpm build` first.** CI orders its steps the same
way for the same reason.

## Commands

```bash
pnpm install
pnpm dev              # vite dev server
pnpm build            # production build (regenerates paraglide + content-collections)
pnpm preview          # serve the build
pnpm check            # svelte-kit sync && svelte-check — needs a prior build, see above
pnpm lint             # prettier --check && eslint
pnpm fix              # prettier --write && eslint --fix
pnpm test             # unit (once) + e2e
```

Run a single unit test:

```bash
pnpm vitest run --project=server src/lib/post-meta.test.ts
```

Vitest is split into two projects in `vite.config.ts`: **client** runs `*.svelte.{test,spec}.ts` in
headless Chromium, **server** runs the rest in node. `expect.requireAssertions` is on — a test that
asserts nothing fails.

## Content

Posts live in `posts/` as Markdown and pass through two independent systems that must stay in sync:
`content-collections.ts` parses frontmatter into `$content`, while mdsvex compiles the same files as
Svelte components.

Missing frontmatter is backfilled from the file path, so `posts/2024/01/04/name.md` yields that date
and slug. Where both exist they are merged rather than one wholly winning: the frontmatter date is
parsed first, then any year, month or day present in the path overwrites the corresponding
component. A post at `posts/2024/x.md` with frontmatter `date: 04.01.2025` therefore resolves to
**2024**-01-04.

Date parsing lives in `src/lib/post-meta.ts` and is covered by `src/lib/post-meta.test.ts`. It
parses **strictly** and deliberately: the accepted formats are ordered most-specific first, because
dayjs returns the first format that matches rather than the best one. Reordering that list, or
relaxing the strict flag, silently turns valid dates into wrong dates instead of errors. Change it
only with the tests in front of you.

`src/lib/date.ts` is the separate, browser-side dayjs setup used for display. Add a
`dayjs/locale/<code>.js` import there for every locale Paraglide gains, or `.locale()` quietly falls
back to English.

## Deployment

Every push runs `verify` — lint, build, typecheck, unit tests. Only then does `deploy` run, so
nothing reaches Cloudflare without passing all four.

Every branch deploys. Cloudflare Pages routes by branch name: the project's production branch goes
live, and any other branch becomes a preview at `<branch>.phyrone.pages.dev`, which is what makes a
pull request reviewable. Deploy is gated to `push` events so a same-repo PR does not deploy twice —
meaning fork PRs never deploy, which is intended, as they must not receive the API token.

Cloudflare Pages is the only target. `adapter-node` and `adapter-static` are **not** installed;
switching would mean adding one back and editing `svelte.config.js`.

## Conventions

- Svelte 5 runes only (`$props`, `$state`) — never `export let`
- Prettier: tabs, single quotes, no trailing commas, 100 columns. Run `pnpm fix` before committing.
- Runtime input validation uses zod
- Path aliases are defined in `svelte.config.js`, not `tsconfig.json`
- **The site never loads scripts, assets or data from an external CDN.** Cloudflare's own
  infrastructure is exempt, as it is the host. Fonts, icons and libraries are bundled from
  `node_modules` — no Google Fonts, no script tags pointing at a CDN.
