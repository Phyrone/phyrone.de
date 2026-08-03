# Build, CI and Code Quality Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make it impossible for a change to reach production without passing lint, typecheck and build — then remove the dead weight that accumulated while nothing was checked.

**Architecture:** Nine sequential tasks. Tasks 1–2 restore the broken toolchain and put a real gate in CI; everything after depends on that gate existing. Tasks 3–8 are cleanup that the gate now protects. Task 9 adds a Content Security Policy and lands last, because it is the only change that can break a page while CI stays green.

**Tech Stack:** SvelteKit 2 + Svelte 5 (runes), TypeScript, Tailwind 4 + DaisyUI, Vite, Vitest, Playwright, pnpm, Cloudflare Pages.

**Source spec:** [`docs/superpowers/specs/2026-08-03-build-ci-quality-design.md`](../specs/2026-08-03-build-ci-quality-design.md)

## Global Constraints

- **Package manager is pnpm.** `.npmrc` sets `engine-strict=true`. Never invoke `npm` or `yarn`.
- **Node `^24`**, declared in `package.json` `engines.node` (added in Task 2).
- **Prettier:** tabs, single quotes, no trailing commas, 100 columns. Run `pnpm fix` before every commit.
- **Svelte 5 runes only** (`$props`, `$state`) — never `export let`.
- **The site never loads scripts, assets or data from an external CDN.** Cloudflare's own infrastructure is exempt, as it is the host. Fonts, icons and libraries are bundled from `node_modules`.
- **Every task ends with `pnpm lint && pnpm check && pnpm build` exiting 0.** From Task 6 onward, also `pnpm vitest run --project=server`.
- Path aliases live in `svelte.config.js`, not `tsconfig.json`: `$lib`, `$styles`, `$assets`, `$posts`, `$components`, `$paraglide`, `$content`.
- `src/lib/paraglide/` and `.content-collections/generated` are **generated and gitignored**. They only exist after a `dev` or `build`. Never commit them; never assume a clean checkout has them.

## Baseline (measured 2026-08-03, before any task)

These numbers were verified by running the commands, not estimated. Use them to confirm you are starting from the expected state.

| Command | Result |
| --- | --- |
| `pnpm lint` | **FAILS** — Prettier flags 2 files in `project.inlang/` |
| `pnpm check` | **CRASHES** — svelte-check refuses to run against TypeScript 7 |
| `pnpm check` (with TS pinned to 6) | **FAILS** — 9 errors, 18 warnings, 10 files with problems |
| `pnpm build` | passes, 19.8s |
| Deploy size | 18 MB, of which **7.4 MB is sourcemaps** (25 `.map` files) |

---

## Task 1: Restore the toolchain

Nothing else in this plan can be verified until `pnpm lint` and `pnpm check` both pass. The 9 type errors below were enumerated by actually pinning TypeScript and running the check — this is the complete list, not a sample.

**Files:**
- Modify: `package.json` (the `typescript` devDependency)
- Modify: `.prettierignore`
- Modify: `eslint.config.js`
- Modify: `src/components/YoutubeVideo.svelte:2`
- Modify: `src/lib/LucidedSimpleIcon.svelte:2`
- Modify: `src/routes/(app)/datatools/DataToolsMenu.svelte:3`
- Modify: `src/routes/(app)/datatools/AddNodeFAB.svelte:2`
- Modify: `src/lib/layouts/default/c-img.svelte:12`
- Modify: `src/lib/images.ts:1,17-21`
- Modify: `src/lib/components/datatools/datatools.ts`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: `get_image(path?: string, post?: string): Picture | undefined` — the return type changes from `EnhancedImgAttributes` to `Picture`. No other task depends on this.

**Background you need:** `svelte-check@4.7.4` hard-refuses TypeScript 7 unless you install *both* TS 6 and TS 7 under an alias and pass `--tsgo`. We are pinning back to TS 6 instead; Task 3 adds a Renovate rule so it cannot be bumped again.

Four files import `lucide-svelte`, which **is not installed** — commit 7a5a6db migrated to `@lucide/svelte` and missed them. All four are currently unreferenced by any route, which is why the build passes while `check` fails: Vite never resolves them, but `svelte-check` reads every file on disk. All six icon names they use (`PlayIcon`, `Icon`, `CatIcon`, `EllipsisIcon`, `MenuIcon`, `PlusIcon`) do exist in `@lucide/svelte@1.28.0`, so a plain rename is sufficient. Do **not** delete these files — `src/routes/(app)/datatools/+page.svelte` is a work-in-progress feature with its body commented out, and these are its components.

- [ ] **Step 1: Pin TypeScript to 6**

```bash
pnpm add -D typescript@6.0.3
```

- [ ] **Step 2: Run the check to confirm the expected 9 errors**

```bash
pnpm check
```

Expected: exits 1, ending with a line reporting **9 ERRORS 18 WARNINGS 10 FILES_WITH_PROBLEMS** (the total file count in that line varies with generated output and is not meaningful). If you see a different *error* count, stop and re-read this task — the list below may no longer be complete.

- [ ] **Step 3: Extend `.prettierignore`**

Replace the whole file with:

```
# Package Managers
package-lock.json
pnpm-lock.yaml
yarn.lock

# Generated — do not format
project.inlang/
.content-collections/
src/lib/paraglide/
.svelte-kit/
dist/
build/
```

- [ ] **Step 4: Extend the ESLint ignore list**

In `eslint.config.js`, replace the `ignores` block:

```js
	{
		ignores: [
			'build/',
			'.svelte-kit/',
			'dist/',
			'.wrangler/',
			'src/lib/paraglide/',
			'.content-collections/'
		]
	},
```

- [ ] **Step 5: Fix the four `lucide-svelte` imports**

Change `'lucide-svelte'` to `'@lucide/svelte'` in each of these, leaving the imported names untouched:

```svelte
<!-- src/components/YoutubeVideo.svelte:2 -->
	import { PlayIcon } from '@lucide/svelte';
```

```svelte
<!-- src/lib/LucidedSimpleIcon.svelte:2 -->
	import { Icon } from '@lucide/svelte';
```

```svelte
<!-- src/routes/(app)/datatools/DataToolsMenu.svelte:3 -->
	import { CatIcon } from '@lucide/svelte';
```

```svelte
<!-- src/routes/(app)/datatools/AddNodeFAB.svelte:2 -->
	import { EllipsisIcon, MenuIcon, PlusIcon } from '@lucide/svelte';
```

- [ ] **Step 6: Type the `failed` snippet parameters**

In `src/lib/layouts/default/c-img.svelte`, line 12. Svelte snippet parameters are implicitly `any` unless annotated, and `strict` mode rejects that.

```svelte
{#snippet failed(error: unknown, reset: () => void)}
```

- [ ] **Step 7: Correct the `get_image` return type**

`<enhanced:img src>` accepts `string | Picture`, but `get_image` claims to return `EnhancedImgAttributes`. That single wrong type causes both remaining errors (`BlogPostCard.svelte:33` and the blog `+page.svelte:38`). In `src/lib/images.ts`, change line 1 and the function:

```ts
import type { Picture } from 'vite-imagetools';
```

```ts
export function get_image(path?: string, post?: string): Picture | undefined {
	if (!path) return undefined;
	if (!post) return images[path] as Picture | undefined;
	const absolute_img_path = new URL(path, 'file:' + '/posts/' + post).pathname;
	return images[absolute_img_path] as Picture | undefined;
}
```

- [ ] **Step 8: Give the node-type map its real component type**

`DtTextInput.svelte` declares `let { id, data }: NodeProps = $props()`, so it is a `Component<NodeProps>`, not a bare `Component`. Replace the whole of `src/lib/components/datatools/datatools.ts`:

```ts
import type { Component } from 'svelte';
import type { NodeProps } from '@xyflow/svelte';
import DtTextInput from './DtTextInput.svelte';

export type DtNodeType = 'text-input';

export const datatoolsNodeTypes: Record<DtNodeType, Component<NodeProps>> = {
	'text-input': DtTextInput
};
```

- [ ] **Step 9: Verify the check now passes**

```bash
pnpm check
```

Expected: `0 ERRORS`. It will still report **18 warnings** — 16 of them are `Unknown at rule @reference / @plugin / @apply` in `datenschutz/+page.svelte` and `impressum/+page.svelte`, which is svelte-check's CSS parser not understanding Tailwind 4 at-rules, plus a `state_referenced_locally` warning in `LucidedSimpleIcon.svelte`. `svelte-check` exits 0 on warnings. Leave them; they are known noise and out of scope.

- [ ] **Step 10: Format and lint**

```bash
pnpm fix && pnpm lint && pnpm build
```

Expected: all three exit 0.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "🔧 Restore working typecheck and lint

Pin typescript to 6 — svelte-check 4.x refuses to run against TS 7
without a TS6+TS7 dual install and --tsgo. Fix the 9 type errors this
surfaces, including four files still importing the uninstalled
lucide-svelte after the @lucide/svelte migration. Ignore generated
output in prettier and eslint."
```

---

## Task 2: CI that gates, and deploys only from main

Today `.github/workflows/build.yaml` builds and then **deploys on every push to every branch**, with no lint, no check, no tests and no concurrency guard.

**Files:**
- Delete: `.github/workflows/build.yaml`
- Create: `.github/workflows/ci.yaml`
- Modify: `package.json` (add `engines`)

**Interfaces:**
- Consumes: `pnpm lint`, `pnpm check`, `pnpm build` all passing (Task 1).
- Produces: a `verify` job that later tasks add steps to (Task 6 adds unit tests, Task 9 adds the external-origin guard), and an artifact named `cloudflare-build`.

**Background you need:** `actions/setup-node` resolves a version from `package.json` in the order `volta.node` → `devEngines.runtime` → `engines.node`. This repo has neither of the first two, so `engines.node` is what applies. `pnpm/action-setup` separately reads the existing `packageManager` field. Together that makes `package.json` the single source of truth for the whole toolchain, with no dotfile to drift.

`^24` rather than `>=24` is deliberate: an open range lets setup-node resolve to the newest Node in existence, including odd-numbered non-LTS lines.

- [ ] **Step 1: Declare the Node version**

Add to `package.json`, as a sibling of `"scripts"`:

```json
	"engines": {
		"node": "^24"
	},
```

- [ ] **Step 2: Verify pnpm accepts it locally**

Because `.npmrc` sets `engine-strict=true`, this is now enforced on install, not advisory.

```bash
node --version && pnpm install
```

Expected: your Node is 24.x and install succeeds. If your local Node is outside `^24`, install will fail — that is the pin working as intended. Either switch Node, or widen the range and note it.

- [ ] **Step 3: Delete the old workflow**

```bash
git rm .github/workflows/build.yaml
```

- [ ] **Step 4: Create `.github/workflows/ci.yaml`**

```yaml
name: CI

on:
  push: {}
  pull_request: {}

jobs:
  verify:
    name: Verify
    runs-on: ubuntu-latest
    concurrency:
      group: verify-${{ github.ref }}
      cancel-in-progress: true
    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Setup pnpm
        uses: pnpm/action-setup@v6

      - name: Setup Node.js
        uses: actions/setup-node@v7
        with:
          node-version-file: 'package.json'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Typecheck
        run: pnpm check

      - name: Build
        run: pnpm build

      - name: Upload build output
        uses: actions/upload-artifact@v4
        with:
          name: cloudflare-build
          path: .svelte-kit/cloudflare
          retention-days: 1

  deploy:
    name: Deploy
    needs: verify
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    concurrency:
      group: deploy
      cancel-in-progress: false
    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Download build output
        uses: actions/download-artifact@v4
        with:
          name: cloudflare-build
          path: .svelte-kit/cloudflare

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v4
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

Two details that matter and should not be "simplified" away:

- `concurrency` is set **per job**, not at workflow level. A workflow-level group with `cancel-in-progress: true` would also cancel in-flight deploys.
- `deploy` uses `cancel-in-progress: false`. Cancelling a half-finished deploy is worse than queueing behind it.
- `deploy` consumes `verify`'s artifact instead of rebuilding, so the bytes that were verified are the bytes that ship.

- [ ] **Step 5: Commit and push, then confirm the gate works**

```bash
pnpm fix && pnpm lint
git add -A
git commit -m "👷 Gate CI on lint, check and build; deploy only from main

Split the single build-and-deploy workflow into a verify job that runs
on every push and PR, and a deploy job that runs only on main and
consumes verify's artifact. Adds per-job concurrency so deploys queue
rather than race. Pins Node via engines.node in package.json."
git push -u origin chore/build-ci-quality
```

- [ ] **Step 6: Verify on GitHub**

Confirm on the Actions tab that the push to `chore/build-ci-quality` ran `verify` and **skipped `deploy`**. This is the single most important assertion in the plan — if `deploy` ran on a non-main branch, the `if:` condition is wrong.

---

## Task 3: Make Renovate automerge safe

`automerge: true` is not the problem — the absent gate was. Now that `verify` runs lint and check, Renovate waits on it before merging. This task tightens the remaining edges.

**Files:**
- Modify: `renovate.json`

**Interfaces:**
- Consumes: the `verify` job from Task 2 as a required status check.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Replace `renovate.json`**

```json
{
	"$schema": "https://docs.renovatebot.com/renovate-schema.json",
	"extends": ["config:recommended"],
	"rebaseWhen": "behind-base-branch",
	"commitMessagePrefix": "⬆️ ",
	"automerge": true,
	"minimumReleaseAge": "3 days",
	"packageRules": [
		{
			"description": "Major bumps get human review — this is how TypeScript 7 silently broke svelte-check.",
			"matchUpdateTypes": ["major"],
			"automerge": false
		},
		{
			"description": "svelte-check 4.x cannot run against TypeScript 7 without a TS6+TS7 dual install and the --tsgo flag. Remove this cap once svelte-check supports TS 7 directly — do not carry it forward blindly.",
			"matchPackageNames": ["typescript"],
			"allowedVersions": "<7"
		},
		{
			"matchPackageNames": ["@sveltejs/**"],
			"groupName": "sveltejs"
		},
		{
			"matchPackageNames": ["tailwindcss", "@tailwindcss/**", "daisyui"],
			"groupName": "tailwind"
		}
	]
}
```

The `description` on the TypeScript rule is load-bearing. Without it the cap becomes permanent by accident.

- [ ] **Step 2: Validate the config parses**

```bash
pnpm dlx --package renovate -- renovate-config-validator renovate.json
```

Expected: `Config validated successfully`. If the validator is unavailable offline, confirm the file is valid JSON with `node -e "JSON.parse(require('fs').readFileSync('renovate.json','utf8')); console.log('ok')"` and move on.

- [ ] **Step 3: Commit**

```bash
pnpm fix
git add -A
git commit -m "🔧 Harden Renovate: hold TS at 6, review majors, age releases"
```

---

## Task 4: Stop shipping sourcemaps to production

7.4 MB of the 18 MB deploy is sourcemaps that nothing consumes — there is no error-reporting service wired up.

**Files:**
- Modify: `vite.config.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing.

- [ ] **Step 1: Record the current sourcemap footprint**

```bash
pnpm build && find .svelte-kit/cloudflare -name '*.map' | wc -l && du -sh .svelte-kit/cloudflare
```

Expected: `25` and `18M`.

- [ ] **Step 2: Turn sourcemaps off**

In `vite.config.ts`, change the `build` block and the `esbuild` block. Note that `esbuild.sourcemap: 'inline'` is separate from `build.sourcemap` — leaving it set would keep inlining maps into the output even after `build.sourcemap: false`. Also drop the no-op `html: {}` key while here.

```ts
	build: {
		minify: 'terser',
		cssMinify: 'lightningcss',
		cssCodeSplit: true,
		sourcemap: false
	},
	experimental: { hmrPartialAccept: true },
	ssr: { target: 'node' },
	json: { stringify: 'auto' },
	esbuild: { charset: 'utf8', format: 'esm' },
```

- [ ] **Step 3: Verify the maps are gone**

```bash
rm -rf .svelte-kit && pnpm build && find .svelte-kit/cloudflare -name '*.map' | wc -l && du -sh .svelte-kit/cloudflare
```

Expected: `0`, and a total around 11 MB.

- [ ] **Step 4: Commit**

```bash
pnpm fix && pnpm lint && pnpm check
git add -A
git commit -m "📦 Stop shipping sourcemaps to production

Drops ~7.4MB from an 18MB deploy. Nothing consumed these maps."
```

---

## Task 5: Remove dead code and fix the year-padding bug

**Files:**
- Modify: `src/routes/(app)/+layout.ts`
- Modify: `src/lib/posts.ts`
- Delete: `src/lib/index.ts`
- Modify: `src/lib/search.ts`
- Modify: `svelte.config.js`
- Modify: `content-collections.ts`
- Modify: `package.json` (remove the `prod` script)
- Delete: `Dockerfile`, `docker-compose.yml`, `.dockerignore`

**Interfaces:**
- Consumes: nothing.
- Produces: `post_to_url(post: Post): string` — unchanged signature, corrected output. Task 6 tests it.

**Background you need:** `src/routes/(app)/+layout.ts` has an **empty load function** but imports `zod` and `moment/min/moment-with-locales` — the full moment build with every locale. Both are unused and ship to the browser on every page.

The `Dockerfile`, `docker-compose.yml` and `prod` script all target `dist/index.js` from `adapter-node`, which is commented out in `svelte.config.js`. All three are already dead.

- [ ] **Step 1: Fix the year-padding bug in `src/lib/posts.ts`**

`post_to_url` pads with the character `'4'` instead of `'0'`, so year 204 renders as `4204`. Find:

```ts
		year: y.toString().padStart(4, '4'),
```

Replace with:

```ts
		year: y.toString().padStart(4, '0'),
```

- [ ] **Step 2: Delete the commented legacy block in `src/lib/posts.ts`**

Everything from the `/*` on line 49 to the end of the file is a commented-out earlier implementation. Delete it, leaving the ~48 lines of live code above it. Then delete the now-unused imports at the top — every `z.` and `moment` reference in the file was inside that block:

```ts
import { resolve } from '$app/paths';
import type { Component } from 'svelte';
import { allPosts } from '$content';
import type { Post } from '$content';
```

- [ ] **Step 3: Strip the dead imports from `src/routes/(app)/+layout.ts`**

Replace the whole file with:

```ts
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async function load() {};
```

- [ ] **Step 4: Try deleting that file entirely**

An empty `load` does nothing. Delete it and confirm the build still passes:

```bash
rm 'src/routes/(app)/+layout.ts' && pnpm build
```

If the build passes, leave it deleted. If it fails, restore the three-line version from Step 3 and move on — do not spend time on it.

- [ ] **Step 5: Delete `src/lib/index.ts`**

The file is entirely commented out, and no file imports `$lib` bare (verified with `grep -rn "from '\$lib'" src`).

```bash
git rm src/lib/index.ts
```

- [ ] **Step 6: Remove the no-op import in `src/lib/search.ts`**

Delete this line:

```ts
import {} from 'fuse.js';
```

- [ ] **Step 7: Remove the unused imports in `content-collections.ts`**

Delete both of these — `git` is never called and `fs` is never referenced:

```ts
import git from 'isomorphic-git';
import fs from 'node:fs';
```

- [ ] **Step 8: Clean up `svelte.config.js`**

Delete the two unused adapter imports:

```js
import adapter_node from '@sveltejs/adapter-node';
import adapter_static from '@sveltejs/adapter-static';
```

Delete the commented-out adapter block inside `kit` (the `/* adapter: adapter_node(...) ... */` section), leaving only:

```js
		adapter: adapter_cloudflare({
			fallback: 'spa'
		}),
```

Also delete the commented `//console.log(html);` inside the `highlight` function.

- [ ] **Step 9: Delete the dead Docker path**

```bash
git rm Dockerfile docker-compose.yml .dockerignore
```

Then remove the `prod` script line from `package.json`:

```json
		"prod": "vite build && deno run --allow-net --allow-read --allow-env --allow-ffi dist/index.js",
```

- [ ] **Step 10: Verify**

```bash
pnpm fix && pnpm lint && pnpm check && pnpm build
```

Expected: all exit 0.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "🔥 Remove dead code, dead deps' imports and the dead Docker path

Deletes ~150 lines of commented legacy in posts.ts, an entirely
commented src/lib/index.ts, unused zod and moment-with-locales imports
behind an empty layout load, and the Dockerfile/compose/prod script that
target the commented-out node adapter.

Fixes post_to_url padding years with '4' instead of '0'."
```

---

## Task 6: Replace moment with dayjs, under test

**This is the only task with real behavioral risk, and the only one that gets tests.**

**Files:**
- Create: `src/lib/post-meta.ts`
- Create: `src/lib/post-meta.test.ts`
- Modify: `content-collections.ts`
- Modify: `.github/workflows/ci.yaml`
- Modify: `package.json` (swap the dependency)

**Interfaces:**
- Consumes: `post_to_url` from Task 5.
- Produces:
  - `DATE_INPUT_FORMATS: string[]`
  - `parse_post_date(input: string): Dayjs`
  - `ARTICLE_DATA_EXTRACT_PATTERN: RegExp`
  - `parse_from_path(path: string): { year?: number; month?: number; day?: number; slug?: string } | null`

**Background you must read before writing code — dayjs is NOT a drop-in for moment.**

This was verified experimentally, not assumed. **moment scores every format in the list and picks the best match. dayjs returns the first format that parses.** The existing list begins with a bare `'DD'`, so a naive port makes dayjs match only the leading `"04"` of `"04.01.2024"` and discard the rest — silently producing today's date. Every single test input differed.

Two changes fix it:

1. **Order the format list most-specific first, with bare `'D'` last.**
2. **Parse in strict mode** (`dayjs(input, FORMATS, true)`). In loose mode `4.1.2024` silently parses to *2027-12-19*. Strict mode's failure is `INVALID` — loud instead of silently wrong, which is what you want for a blog archive.

Strict mode requires **both padded and unpadded variants**: dayjs's `D` rejects `"04"` and `DD` rejects `"4"`.

With that list, 16 of 17 test inputs match moment exactly. The one difference is an **improvement**: for `32.01.2024`, moment silently returns *2032-01-19* (reinterpreting `32` as a two-digit year) while dayjs correctly rejects it.

`content-collections.ts` runs at build time in Node, so after Task 5 dayjs never enters the client bundle. It **can** import from `src/lib/` — this was verified by probe build.

- [ ] **Step 1: Swap the dependency**

```bash
pnpm remove moment && pnpm add dayjs
```

- [ ] **Step 2: Write the failing test**

Create `src/lib/post-meta.test.ts`. Assertions use local date components rather than ISO strings so they do not depend on the runner's timezone. Fake timers pin "today" because the year-less formats (`'DD'`, `'DD.MM'`) fill missing parts from the current date.

```ts
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { parse_post_date, parse_from_path } from './post-meta.ts';

describe('parse_post_date', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 7, 3, 12, 0, 0));
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it('parses the padded German format used by real post frontmatter', () => {
		const d = parse_post_date('04.01.2025 12:00:00');
		expect(d.isValid()).toBe(true);
		expect([d.year(), d.month() + 1, d.date(), d.hour(), d.minute(), d.second()]).toEqual([
			2025, 1, 4, 12, 0, 0
		]);
	});

	it('parses a date without a time', () => {
		const d = parse_post_date('04.01.2024');
		expect([d.year(), d.month() + 1, d.date()]).toEqual([2024, 1, 4]);
	});

	it('parses ISO-style and dotted year-first formats', () => {
		for (const input of ['2024-01-04', '2024.01.04', '2024-1-4']) {
			const d = parse_post_date(input);
			expect([input, d.year(), d.month() + 1, d.date()]).toEqual([input, 2024, 1, 4]);
		}
	});

	it('parses unpadded day and month', () => {
		const d = parse_post_date('4.1.2024');
		expect([d.year(), d.month() + 1, d.date()]).toEqual([2024, 1, 4]);
	});

	it('parses an unpadded date with an unpadded time', () => {
		const d = parse_post_date('4.1.2024 9:05');
		expect([d.year(), d.month() + 1, d.date(), d.hour(), d.minute()]).toEqual([2024, 1, 4, 9, 5]);
	});

	it('parses a two-digit year', () => {
		const d = parse_post_date('04.01.24');
		expect([d.year(), d.month() + 1, d.date()]).toEqual([2024, 1, 4]);
	});

	it('parses the dash-separated time variant', () => {
		const d = parse_post_date('04.01.2024-13:45');
		expect([d.year(), d.month() + 1, d.date(), d.hour(), d.minute()]).toEqual([2024, 1, 4, 13, 45]);
	});

	it('fills a missing year and month from today', () => {
		const d = parse_post_date('15');
		expect([d.year(), d.month() + 1, d.date()]).toEqual([2026, 8, 15]);
	});

	it('fills a missing year from today', () => {
		const d = parse_post_date('04.03');
		expect([d.year(), d.month() + 1, d.date()]).toEqual([2026, 3, 4]);
	});

	it('does not let the bare day format swallow a full date', () => {
		// Regression guard: with 'D' ordered first, dayjs matched only the
		// leading "04" and returned today instead of 2024-01-04.
		const d = parse_post_date('04.01.2024');
		expect(d.year()).not.toBe(2026);
	});

	it('rejects unparseable input', () => {
		expect(parse_post_date('garbage').isValid()).toBe(false);
		expect(parse_post_date('').isValid()).toBe(false);
	});

	it('rejects an out-of-range month', () => {
		expect(parse_post_date('01.13.2024').isValid()).toBe(false);
	});

	it('rejects an out-of-range day instead of reinterpreting it as a year', () => {
		// moment returned 2032-01-19 here. Rejecting is the correct behavior.
		expect(parse_post_date('32.01.2024').isValid()).toBe(false);
	});
});

describe('parse_from_path', () => {
	it('extracts year and slug from a year-only path', () => {
		expect(parse_from_path('2024/test')).toEqual({
			year: 2024,
			month: undefined,
			day: undefined,
			slug: 'test'
		});
	});

	it('extracts a full year/month/day path', () => {
		expect(parse_from_path('2024/01/04/my-post')).toEqual({
			year: 2024,
			month: 1,
			day: 4,
			slug: 'my-post'
		});
	});

	it('extracts year and month when the day is absent', () => {
		expect(parse_from_path('2024/01/my-post')).toEqual({
			year: 2024,
			month: 1,
			day: undefined,
			slug: 'my-post'
		});
	});

	it('extracts a bare slug with no date parts', () => {
		expect(parse_from_path('just-a-slug')).toEqual({
			year: undefined,
			month: undefined,
			day: undefined,
			slug: 'just-a-slug'
		});
	});

	it('takes the last segment as the slug for nested paths', () => {
		expect(parse_from_path('nested/dir/post')?.slug).toBe('post');
	});

	it('takes the last segment as the slug under a dated path', () => {
		expect(parse_from_path('2024/01/04/deep/post')).toEqual({
			year: 2024,
			month: 1,
			day: 4,
			slug: 'post'
		});
	});
});
```

- [ ] **Step 3: Run the test to verify it fails**

```bash
pnpm vitest run --project=server src/lib/post-meta.test.ts
```

Expected: FAIL — `Cannot find module './post-meta.ts'`.

- [ ] **Step 4: Write `src/lib/post-meta.ts`**

```ts
import dayjs, { type Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat);

/**
 * Ordered most-specific first, with the bare day formats last.
 *
 * moment scored every format and picked the best match. dayjs returns the
 * FIRST format that parses, so a bare 'D' near the front would match only the
 * leading digits of a full date and silently discard the rest.
 *
 * Both zero-padded and unpadded variants are required because parsing is
 * strict: dayjs's 'D' rejects '04' and its 'DD' rejects '4'.
 */
export const DATE_INPUT_FORMATS = [
	'DD.MM.YYYY HH:mm:ss',
	'DD.MM.YYYY-HH:mm:ss',
	'D.M.YYYY H:mm:ss',
	'D.M.YYYY-H:mm:ss',
	'DD.MM.YYYY HH:mm',
	'DD.MM.YYYY-HH:mm',
	'D.M.YYYY H:mm',
	'D.M.YYYY-H:mm',
	'YYYY-MM-DD',
	'YYYY.MM.DD',
	'YYYY-M-D',
	'YYYY.M.D',
	'DD.MM.YYYY',
	'D.M.YYYY',
	'DD.MM.YY',
	'D.M.YY',
	'DD.MM',
	'D.M',
	'DD',
	'D'
];

/**
 * Parses a post date. Strict on purpose: in loose mode dayjs turns '4.1.2024'
 * into 2027-12-19 rather than failing, and a silently wrong date in a blog
 * archive is worse than a loud invalid one.
 */
export function parse_post_date(input: string): Dayjs {
	return dayjs(input, DATE_INPUT_FORMATS, true);
}

export const ARTICLE_DATA_EXTRACT_PATTERN =
	/^(?:(?<year>\d{4})[-/](?:(?<month>[0-1]?\d)[-/](?:(?<day>[0-3]?\d)[-/])?)?)?(?:[a-zA-Z0-9][^/]+?\/)*?(?<slug>[a-zA-Z0-9][^/]+?)(?:\/index)?$/;

export function parse_from_path(path: string): null | {
	year: number | undefined;
	month: number | undefined;
	day: number | undefined;
	slug: string | undefined;
} {
	const parsed = ARTICLE_DATA_EXTRACT_PATTERN.exec(path);
	if (!parsed) return null;

	return {
		year: parsed.groups?.year ? parseInt(parsed.groups.year) : undefined,
		month: parsed.groups?.month ? parseInt(parsed.groups.month) : undefined,
		day: parsed.groups?.day ? parseInt(parsed.groups.day) : undefined,
		slug: parsed.groups?.slug
	};
}
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
pnpm vitest run --project=server src/lib/post-meta.test.ts
```

Expected: PASS, 19 tests.

- [ ] **Step 6: Rewire `content-collections.ts` onto the new module**

Delete the local `DATE_INPUT_FORMATS`, `ARTICLE_DATA_EXTRACT_PATTERN` and `parse_from_path`, and both moment imports. Add at the top:

```ts
import { parse_post_date, parse_from_path } from './src/lib/post-meta.ts';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
```

Change the schema's `date` transform:

```ts
		date: z.coerce.string().transform((d) => parse_post_date(d)),
```

Change `date_if_blog_post` to return `Dayjs` and use `dayjs(0)` as the fallback:

```ts
async function date_if_blog_post(
	doc: CollectionsSchema<'frontmatter-only', typeof PostMetadata>,
	extract: ReturnType<typeof parse_from_path>
): Promise<Dayjs> {
	let date = doc.date ?? dayjs(0);

	if (extract?.year && extract?.month && extract?.day) {
		return dayjs(new Date(extract.year, extract.month - 1, extract.day));
	}
	if (extract?.year) {
		date = date.year(extract.year);
	}
	if (extract?.month) {
		date = date.month(extract.month - 1);
	}
	if (extract?.day) {
		date = date.date(extract.day);
	}

	return date;
}
```

`.toDate()` in the `transform` below is unchanged — dayjs has the same method.

- [ ] **Step 7: Verify the real post still gets the right date**

`posts/2024/test.md` has `date: '04.01.2025 12:00:00'` in its frontmatter.

```bash
rm -rf .content-collections && pnpm build && grep -rn 'date' .content-collections/generated/allPosts.js | head -5
```

Expected: a date of **4 January 2025, 12:00**. The two failure modes this catches are today's date (the format list is mis-ordered, so a bare day format swallowed the input) and the epoch / 1970 (parsing returned invalid and fell back to `dayjs(0)`). Either means the format list is wrong — go back to Step 4.

- [ ] **Step 8: Add the unit-test step to CI**

In `.github/workflows/ci.yaml`, insert between the `Typecheck` and `Build` steps:

```yaml
      - name: Unit tests
        run: pnpm vitest run --project=server
```

This is added now rather than in Task 2 because before this task there were no tests, and a step that passes against an empty test set is worse than no step.

- [ ] **Step 9: Full verification**

```bash
pnpm fix && pnpm lint && pnpm check && pnpm vitest run --project=server && pnpm build
```

Expected: all exit 0.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "✅ Replace moment with dayjs, with tests

dayjs is not a drop-in: it returns the first matching format where moment
scored all of them, so the old list beginning with a bare 'DD' matched
only the leading digits of every date. Reorders the list most-specific
first and parses strictly — loose mode turned '4.1.2024' into 2027-12-19
silently.

Extracts date and path parsing into src/lib/post-meta.ts so it can be
tested, and runs the suite in CI."
```

---

## Task 7: Remove unused dependencies

Every package below was verified as never imported anywhere in `src/`, `utils/`, `posts/` or the root config files. Three specifics worth knowing: **no Tailwind plugin is registered in `src/app.css` at all** (it contains only `@import 'tailwindcss'` and two DaisyUI `@plugin` lines), `isomorphic-git` was imported but never called (removed in Task 5), and `ms` appears only inside a comment.

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`

**Interfaces:**
- Consumes: Task 5's import removals — several of these are only removable because their imports are already gone.
- Produces: nothing.

- [ ] **Step 1: Remove all 27 packages in one command**

```bash
pnpm remove install node-gyp node-addon-api autoprefixer dashjs etag @types/etag qs @types/qs css-select sass-embedded @types/rellax @embedz/svelte remark-directive remark-heading-id remark-reading-time isomorphic-git ms @types/ms @tailwindcss/aspect-ratio @tailwindcss/container-queries @tailwindcss/forms @tailwindcss/typography tailwindcss-intersect tailwindcss-motion @sveltejs/adapter-node @sveltejs/adapter-static
```

- [ ] **Step 2: Verify from a clean install**

A stale `node_modules` can mask a removed dependency, so wipe it.

```bash
rm -rf node_modules .svelte-kit .content-collections && pnpm install && pnpm lint && pnpm check && pnpm vitest run --project=server && pnpm build
```

Expected: all exit 0.

- [ ] **Step 3: If anything failed, restore packages one at a time**

Do **not** revert the whole batch. Read the error, identify the single package it names, restore just that one with `pnpm add -D <package>`, and re-run Step 2. Record which package had to come back and why, in the commit message. A package can be needed without appearing in an import — a Vite plugin resolved by name, or a PostCSS convention.

- [ ] **Step 4: Commit**

```bash
pnpm fix
git add -A
git commit -m "🔥 Remove 27 unused dependencies

None are imported anywhere. Notably no Tailwind plugin is registered in
app.css, so all six Tailwind plugin packages were dead, and both unused
adapters go with the Docker path removed in the previous commit."
```

---

## Task 8: Script hygiene, Playwright config and docs

**Files:**
- Modify: `package.json` (the `test` script)
- Modify: `playwright.config.ts`
- Create: `.editorconfig`
- Create: `README.md`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing.

**Note:** this task fixes the Playwright *configuration* so the harness is correct whenever e2e tests get written. It does **not** add an e2e run to CI — there are no e2e tests, and there is no point booting a browser to run nothing.

- [ ] **Step 1: Fix the `test` script to use pnpm**

This is an `engine-strict` pnpm repo; the script currently shells out to `npm run`. In `package.json`:

```json
		"test": "pnpm test:unit --run && pnpm test:e2e",
```

- [ ] **Step 2: Give Playwright real CI settings**

Replace `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
	testMatch: '**/*.e2e.{ts,js}',
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		baseURL: 'http://localhost:4173'
	},
	webServer: {
		command: 'pnpm build && pnpm preview',
		port: 4173,
		reuseExistingServer: !process.env.CI
	}
});
```

- [ ] **Step 3: Add `.editorconfig` matching the Prettier config**

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = tab
max_line_length = 100

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml,json}]
indent_style = space
indent_size = 2
```

- [ ] **Step 4: Write `README.md`**

The single most valuable thing this documents is the generated-directories trap.

````markdown
# phyrone.de

Personal homepage and blog. SvelteKit 2 + Svelte 5 (runes), TypeScript, Tailwind 4 + DaisyUI,
prerendered and deployed to Cloudflare Pages.

## Prerequisites

- Node `^24` (enforced — `engine-strict` is on)
- pnpm (the version is pinned in `package.json` via `packageManager`; `corepack enable` will honour it)

## A clean checkout looks broken until you build

Two directories are generated and gitignored:

- `src/lib/paraglide/` — the Paraglide i18n runtime, aliased as `$paraglide`
- `.content-collections/generated` — post metadata, aliased as `$content`

Neither exists until the first `pnpm dev` or `pnpm build`, so imports from them show as unresolved
in a fresh clone. This is expected. Run a build first.

## Commands

```bash
pnpm install
pnpm dev              # vite dev server
pnpm build            # production build (regenerates paraglide + content-collections)
pnpm preview          # serve the build
pnpm check            # svelte-kit sync && svelte-check
pnpm lint             # prettier --check && eslint
pnpm fix              # prettier --write && eslint --fix
pnpm test             # unit (once) + e2e
```

Run a single unit test:

```bash
pnpm vitest run --project=server src/lib/post-meta.test.ts
```

## Content

Posts live in `posts/` as Markdown and pass through two independent systems that must stay in sync:
`content-collections.ts` parses frontmatter into `$content`, while mdsvex compiles the same files as
Svelte components. Missing frontmatter is backfilled from the file path — `posts/2024/01/04/name.md`
yields that date and slug. Frontmatter wins over the path.

## Deployment

Every push runs the `verify` job (lint, typecheck, unit tests, build). Only `main` deploys, and the
deploy reuses the exact artifact that was verified.

Cloudflare Pages is the only deploy target. `adapter-node` and `adapter-static` are **not**
installed; switching targets means adding one back and changing `svelte.config.js`.

## Conventions

- Svelte 5 runes only (`$props`, `$state`) — never `export let`
- Prettier: tabs, single quotes, no trailing commas, 100 columns
- Runtime input validation uses zod, configured `jitless` so it works under the CSP
- **The site never loads scripts, assets or data from an external CDN.** Fonts, icons and libraries
  are bundled from `node_modules`. A CI check enforces this.
````

- [ ] **Step 5: Verify**

```bash
pnpm fix && pnpm lint && pnpm check && pnpm vitest run --project=server && pnpm build
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "📝 Add README and .editorconfig, fix test scripts

Documents the generated-directory trap that makes a clean checkout look
broken. Switches the test script off npm and gives Playwright real CI
settings."
```

---

## Task 9: Content Security Policy and the no-external-origin guard

**This task lands last and is the riskiest in the plan.** A CSP can break a page while the build stays green.

**Files:**
- Modify: `svelte.config.js`
- Modify: `src/hooks.ts`
- Create: `scripts/check-no-external-origins.mjs`
- Modify: `package.json` (add a script)
- Modify: `.github/workflows/ci.yaml`

**Interfaces:**
- Consumes: everything above; a clean codebase makes CSP violations traceable.
- Produces: a `pnpm check:origins` script the CI `verify` job runs.

**Background you must read — zod breaks under a strict CSP.**

Zod 4 compiles validators with `new Function`. Under a strict CSP this fails twice over: the JIT is blocked, *and* zod's capability probe fires a `securitypolicyviolation` report even though it catches the resulting throw. Zod's own source says so, in `node_modules/zod/v4/core/util.js`:

> Skip the probe under `jitless`: strict CSPs report the caught `new Function` as a
> `securitypolicyviolation` even though the throw is swallowed.

The fix is `z.config({ jitless: true })`. It must run **before the first parse**, because zod memoizes that probe via `cached()`.

Only the browser needs this. Zod already disables eval on Cloudflare Workers by checking `navigator.userAgent.includes("Cloudflare")`, so the server side is jitless already. And after Task 5 the only client-side zod schema left is the four route params in the blog `+page.ts`, so interpreted validation costs nothing measurable.

An audit confirmed the no-CDN rule currently holds: all ~40 external URLs in `src/` are `<a href>` hyperlinks, fonts come from bundled `@fontsource-variable/*` packages, and the only external resource is the click-gated `youtube-nocookie.com` iframe.

- [ ] **Step 1: Make zod jitless on the client**

Add to the top of `src/hooks.ts`, above the existing `reroute` export. `src/hooks.ts` is the universal hooks file and loads before any route `load` runs.

```ts
import { z } from 'zod';

// Zod 4 JITs validators with `new Function`. Under our CSP that is blocked, and
// zod's capability probe reports a securitypolicyviolation even when it catches
// the throw. Must be set before the first parse — the probe result is memoized.
z.config({ jitless: true });
```

- [ ] **Step 2: Add the CSP in report-only mode first**

In `svelte.config.js`, inside `kit`, alongside `adapter` and `alias`:

```js
		csp: {
			mode: 'auto',
			reportOnly: {
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
```

No `report-uri` — this is a static site with no endpoint to collect reports. In report-only mode the browser logs every violation to the console, which is what Step 3 reads.

- [ ] **Step 3: Check every page for violations, with the console open**

```bash
pnpm build && pnpm preview
```

Visit each of these and watch the browser console for `Content Security Policy` reports:

- `/` — the landing page
- `/blog` — the post list
- `/blog/2025/01/04/test` — a post page. **This one matters most**: it is the only route that runs the client-side zod schema, so it proves Step 1 worked.
- `/datatools`
- `/impressum`
- `/datenschutz`

Write down every violation you see. Report-only mode means the page still works, so you must read the console — a page that looks fine can still be reporting.

- [ ] **Step 4: Widen only the directives that actually reported**

For each violation, add the minimum needed directive. Do not paste in a permissive default. If you find yourself adding `unsafe-eval`, stop — that means Step 1 did not take effect, and the fix is to make `z.config` run earlier, not to loosen the policy.

- [ ] **Step 5: Switch to enforcing**

Once Step 3 produces a clean console on every route, rename the `reportOnly` key to `directives` and delete the `report-uri` line:

```js
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				...
			}
		},
```

- [ ] **Step 6: Re-verify all six routes in enforcing mode**

```bash
pnpm build && pnpm preview
```

Walk the same six routes again. In enforcing mode a mistake now breaks the page rather than just logging, so check that images render, the sidebar icons appear, and a blog post loads its content.

- [ ] **Step 7: Write the external-origin guard**

Create `scripts/check-no-external-origins.mjs`:

```js
#!/usr/bin/env node
// Fails if the build output loads any script, stylesheet, font or image from a
// host we do not control. Hyperlinks (<a href>) are deliberately not matched —
// linking out is fine, loading from outside is not.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = '.svelte-kit/cloudflare';
const SCANNED = new Set(['.html', '.css', '.js']);

const ALLOWED = [/^https?:\/\/(?:[a-z0-9-]+\.)*phyrone\.de(?:[/:?#]|$)/i];

// Resource-loading positions only: <script src>, <link href>, and CSS url().
const PATTERNS = [
	/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi,
	/<link\b[^>]*\bhref\s*=\s*["']([^"']+)["']/gi,
	/url\(\s*["']?([^"')]+)["']?\s*\)/gi
];

function* walk(dir) {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) yield* walk(full);
		else yield full;
	}
}

const violations = [];

for (const file of walk(ROOT)) {
	if (!SCANNED.has(extname(file))) continue;
	const source = readFileSync(file, 'utf8');
	for (const pattern of PATTERNS) {
		pattern.lastIndex = 0;
		let match;
		while ((match = pattern.exec(source)) !== null) {
			const url = match[1];
			if (!/^https?:\/\//i.test(url)) continue;
			if (ALLOWED.some((allowed) => allowed.test(url))) continue;
			violations.push(`${file}: ${url}`);
		}
	}
}

if (violations.length > 0) {
	console.error('External origins found in build output:\n');
	for (const violation of violations) console.error('  ' + violation);
	console.error(
		'\nThis site must not load scripts, assets or data from an external CDN.' +
			'\nBundle the dependency from node_modules instead.'
	);
	process.exit(1);
}

console.log('No external origins in build output.');
```

- [ ] **Step 8: Wire it into package.json**

```json
		"check:origins": "node scripts/check-no-external-origins.mjs",
```

- [ ] **Step 9: Run it against the current build**

```bash
pnpm build && pnpm check:origins
```

Expected: `No external origins in build output.` If it reports the YouTube iframe, that is a false positive from an `<iframe src>` — the patterns above deliberately do not match `<iframe>`; if you see it, the component is emitting a `<link>` or `<script>` instead and that is worth investigating rather than silencing.

- [ ] **Step 10: Add the guard to CI**

In `.github/workflows/ci.yaml`, immediately after the `Build` step and before `Upload build output`:

```yaml
      - name: Check for external origins
        run: pnpm check:origins
```

- [ ] **Step 11: Full clean verification**

```bash
rm -rf node_modules .svelte-kit .content-collections && pnpm install && pnpm lint && pnpm check && pnpm vitest run --project=server && pnpm build && pnpm check:origins
```

Expected: all exit 0.

- [ ] **Step 12: Commit**

```bash
pnpm fix
git add -A
git commit -m "🔒 Add CSP and enforce the no-external-CDN rule

Sets zod jitless on the client — zod 4 JITs validators with new Function,
and even its capability probe trips a strict CSP. Adds a build-output
guard so a future dependency cannot quietly reintroduce a CDN load."
```

---

## Final verification

Run from a completely clean state, to prove nothing depends on stale generated output:

```bash
rm -rf node_modules .svelte-kit .content-collections && pnpm install && pnpm lint && pnpm check && pnpm vitest run --project=server && pnpm build && pnpm check:origins
```

Then confirm, by hand:

- [ ] Pushing this branch runs `verify` and **does not** deploy.
- [ ] All six routes load with no console errors and no `securitypolicyviolation` reports.
- [ ] `find .svelte-kit/cloudflare -name '*.map' | wc -l` returns `0`.
- [ ] The test post at `/blog/2025/01/04/test` renders with the date 4 January 2025.

## Known items deliberately left undone

- 18 `svelte-check` warnings remain: 16 are Tailwind 4 at-rules (`@reference`, `@plugin`, `@apply`) that svelte-check's CSS parser does not recognise, plus a `state_referenced_locally` warning in `LucidedSimpleIcon.svelte`. `svelte-check` exits 0 on warnings.
- `no-explicit-any` and `ban-ts-comment` stay disabled; stricter `tsconfig` flags are not enabled.
- The 877-line `datenschutz/+page.svelte` is not translated into Paraglide messages.
- unlighthouse stays configured but unrun in CI.
- No e2e tests are written; Task 8 only corrects the harness config.
