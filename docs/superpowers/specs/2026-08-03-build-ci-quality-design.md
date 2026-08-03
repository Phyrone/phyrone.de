# Build, CI and Code Quality Overhaul

**Date:** 2026-08-03
**Scope:** Foundations + hygiene. Writing a broad test suite is explicitly deferred.

## Problem

The repository has no working verification. Three failures compound each other:

1. `pnpm check` crashes on startup. Renovate bumped `typescript` to `^7.0.2`; `svelte-check@4.7.4`
   refuses to run without a TypeScript 6 + TypeScript 7 alias pair and a `--tsgo` flag. The project
   has had no typecheck for an unknown period.
2. CI runs `pnpm build` and nothing else, so the broken typecheck was never reported.
3. `renovate.json` sets `automerge: true`. Because the only status check is a build, dependency
   bumps that break typecheck or lint merge themselves.

The TypeScript 7 bump is the visible result of this loop. Any future bump behaves the same way.

Two further problems are independent of that loop:

- The CI workflow deploys to Cloudflare Pages on **every push to every branch**, with no
  `concurrency` guard, so feature branches deploy and parallel deploys can race.
- 7.4 MB of sourcemaps ship to production, out of an 18 MB total deploy.

## Goals

- No change can reach `main` without passing lint, typecheck and build.
- No branch other than `main` deploys.
- Dependency automerge becomes safe by making the gate real, not by disabling it.
- Remove accumulated dead weight: unused dependencies, dead code, dead deploy paths.

## Non-goals

- A broad test suite. Only the `moment` replacement gets tests (see part 6), because that change
  carries real behavioral risk.
- Enabling `no-explicit-any` or stricter `tsconfig` flags.
- Translating the 877-line `datenschutz` page into Paraglide messages.
- Running unlighthouse in CI.

## Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| TypeScript 7 | Pin back to `^6`, hold via Renovate rule | Restores `pnpm check` with zero risk. The TS 6 + TS 7 dual-install that `svelte-check` suggests is bleeding-edge and may not satisfy typescript-eslint. Revisit deliberately. |
| Docker / node adapter | Delete | `Dockerfile`, `docker-compose.yml` and the `prod` script all target `dist/index.js` from the node adapter, which is commented out in `svelte.config.js`. All three are already dead. Cloudflare Pages is the only real target. |
| Node version pin | `engines.node` in `package.json` | Standard field. `actions/setup-node` reads it via `node-version-file: 'package.json'`. |
| moment replacement | `dayjs` + `customParseFormat` | Accepts a format array directly, matching the current `moment(d, FORMATS, 'de', false)` call. Setters and `.toDate()` map 1:1. |

---

## Part 1 — Restore the toolchain

Nothing else can be verified until these pass.

- `typescript` → `^6` in `devDependencies`.
- `.prettierignore` gains generated and output paths: `project.inlang/`, `.content-collections/`,
  `src/lib/paraglide/`, `.svelte-kit/`, `dist/`. Currently `pnpm lint` fails on two generated
  `project.inlang/` files.
- `eslint.config.js` `ignores` gains `src/lib/paraglide/` and `.content-collections/`.
- Fix whatever real errors `pnpm check` reports once it can run. This is an unknown quantity until
  the pin lands — it is the one part of this spec whose size cannot be predicted up front.

**Done when:** `pnpm lint` and `pnpm check` both exit 0.

## Part 2 — CI that gates

Replace `.github/workflows/build.yaml` with a single workflow containing two jobs.

**`verify`** — triggers on every `push` and `pull_request`:

```
install (frozen lockfile)
  → pnpm lint
  → pnpm check
  → pnpm vitest run --project=server   (once part 6 adds tests)
  → pnpm build
  → upload .svelte-kit/cloudflare as an artifact
concurrency: group: ci-${{ github.ref }}, cancel-in-progress: true
```

**`deploy`** — `needs: verify`, `if: github.ref == 'refs/heads/main'`:

```
download the build artifact → wrangler pages deploy
concurrency: group: deploy, cancel-in-progress: false
```

Deploy consumes `verify`'s artifact rather than rebuilding. Rebuilding would both double the CI
time and deploy a *different* artifact than the one that was verified.

`cancel-in-progress: false` on deploy is deliberate: cancelling a half-finished deploy is worse than
queueing behind it.

The unit test step is added to this job as part of part 6, not before — there are no tests to run
until then. Adding it earlier would mean a step that silently passes on an empty test set.

Node version resolution:

```json
"engines": { "node": "^24" }
```

```yaml
- uses: actions/setup-node@v7
  with:
    node-version-file: 'package.json'
    cache: 'pnpm'
```

`setup-node` resolves package.json in the order `volta.node` → `devEngines.runtime` →
`engines.node`. This repo has neither of the first two, so `engines.node` applies.
`pnpm/action-setup` already reads the existing `packageManager` field, so package.json becomes the
single source of truth for both toolchain versions and no separate dotfile can drift.

Two consequences, accepted:

- `.npmrc` already sets `engine-strict=true`, so `engines.node` is enforced on local installs too.
  Upgrading local Node past the range hard-fails `pnpm install` until the field is bumped. This is
  the intended behavior of a pin, and it fails loudly rather than silently.
- `^24` rather than `>=24`, because an open range lets `setup-node` resolve to the newest Node in
  existence including odd-numbered non-LTS lines. `^24` stays on the latest 24.x LTS patch, and
  Renovate proposes the major bump as a reviewable PR.

**Done when:** a push to a non-`main` branch runs `verify` and does not deploy; a push to `main`
runs both.

## Part 3 — Renovate

`automerge: true` stays. It becomes safe once `verify` is a real gate, because Renovate waits on
branch status before merging. Additions to `renovate.json`:

- `minimumReleaseAge: "3 days"` — avoids pulling a release that is retracted hours later.
- `automerge: false` for `matchUpdateTypes: ["major"]` — majors get human review.
- A `packageRule` holding `typescript` to major 6, with a comment pointing at the `svelte-check`
  incompatibility so the constraint is not cargo-culted forward.
- Grouping for `@sveltejs/*` and for Tailwind + DaisyUI, so related packages move together.

## Part 4 — Stop shipping sourcemaps

In `vite.config.ts`: set `build.sourcemap: false` and remove `esbuild.sourcemap: 'inline'`.

Nothing consumes these maps — there is no error reporting service wired up — and they are 7.4 MB of
the 18 MB deploy.

Also remove the no-op `html: {}` key while in the file.

**Done when:** `find .svelte-kit/cloudflare -name '*.map'` returns nothing after a build.

## Part 5 — Dependency removal

Each package below was verified as never imported anywhere in `src/`, `utils/`, `posts/` or the root
config files. Notable specifics:

- No Tailwind plugin is registered in `src/app.css` at all — it contains only
  `@import 'tailwindcss'` and two DaisyUI `@plugin` lines. All six Tailwind plugin packages are
  dead.
- `isomorphic-git` is imported in `content-collections.ts` but never called.
- `ms` appears only inside a comment in `AddNodeFAB.svelte`.

Remove: `install`, `node-gyp`, `node-addon-api`, `autoprefixer`, `dashjs`, `etag`, `@types/etag`,
`qs`, `@types/qs`, `css-select`, `sass-embedded`, `@types/rellax`, `@embedz/svelte`,
`remark-directive`, `remark-heading-id`, `remark-reading-time`, `isomorphic-git`, `ms`, `@types/ms`,
`@tailwindcss/aspect-ratio`, `@tailwindcss/container-queries`, `@tailwindcss/forms`,
`@tailwindcss/typography`, `tailwindcss-intersect`, `tailwindcss-motion`, `@sveltejs/adapter-node`,
`@sveltejs/adapter-static`.

That is 27 packages. Removed as one batch; if verification fails, packages are restored
individually rather than reverting the batch, so the actual dependency is identified.

**Done when:** `pnpm install && pnpm lint && pnpm check && pnpm build` all pass.

## Part 6 — moment → dayjs

`moment` is used in `content-collections.ts` for German-format date parsing, and imported in
`src/lib/posts.ts` where only the commented-out legacy block uses it (that import disappears with
part 7).

Mapping:

| moment | dayjs |
| --- | --- |
| `moment(d, DATE_INPUT_FORMATS, 'de', false)` | `dayjs(d, DATE_INPUT_FORMATS)` via `customParseFormat` |
| `moment(0)` | `dayjs(0)` |
| `.year(n)` / `.month(n)` / `.date(n)` | identical |
| `.toDate()` | identical |

The existing code already reassigns (`date = date.year(...)`) rather than relying on mutation, so
dayjs's immutability is not a behavioral change.

**This part gets unit tests**, as a deliberate exception to the non-goals. `DATE_INPUT_FORMATS`
includes year-less entries (`'DD'`, `'DD.MM'`) whose fallback behavior differs between the two
libraries, and verifying that by eye is less reliable than testing it. Tests cover
`ARTICLE_DATA_EXTRACT_PATTERN` path extraction, the format list against representative inputs, and
the `date_if_blog_post` precedence rules (frontmatter wins over path).

This also gives the existing but unused vitest `server` project its first real use.

**Done when:** tests pass and a build produces the same post dates as before the change.

## Part 7 — Dead code

- `src/lib/posts.ts`: delete the ~150-line commented legacy block, leaving ~60 lines of live code.
- **Bug fix:** `post_to_url` calls `y.toString().padStart(4, '4')`. The pad character is `'4'`,
  which produces `4204` for year 204. Almost certainly meant `'0'`. Fixed, with a test.
- `src/lib/index.ts`: delete. It is entirely comments, and no file imports `$lib` bare (verified).
- `src/lib/search.ts`: remove the no-op `import {} from 'fuse.js'`.
- `svelte.config.js`: remove the commented-out `adapter_node` / `adapter_static` blocks, their now
  unused imports, and the dead `console.log`.
- Delete `Dockerfile`, `docker-compose.yml`, `.dockerignore`, and the `prod` script.

## Part 8 — Scripts and docs

- `test` script: `npm run` → `pnpm` (this is an `engine-strict` pnpm repo).
- `playwright.config.ts`: add `forbidOnly: !!process.env.CI`, `retries: process.env.CI ? 2 : 0`,
  `reporter: process.env.CI ? 'github' : 'list'`, `use.baseURL: 'http://localhost:4173'`, and
  `webServer.reuseExistingServer: !process.env.CI`. Change the webServer command from `npm run` to
  `pnpm`. These settings are configured now so the harness is correct when e2e tests are eventually
  written; no e2e run is added to CI in this round.
- Add `.editorconfig` matching the Prettier config (tabs, 100 columns).
- Add `README.md`. The highest-value content is the non-obvious part: `$paraglide`
  (`src/lib/paraglide/`) and `$content` (`.content-collections/generated`) are both generated and
  gitignored, so a clean checkout has broken imports until the first `pnpm dev` or `pnpm build`.
  Also: prerequisites, the commands table, and the Cloudflare Pages deploy story.

---

## Sequencing

Parts 1 and 2 land first and separately. Until CI gates on `check`, every subsequent change goes in
unverified — so the gate is the prerequisite for trusting the rest of the work, not a finishing
touch.

After that, parts 3–8 are largely independent. Part 7's removal of the `moment` import from
`posts.ts` should land with or after part 6 to avoid a transient broken state.

## Verification

After each part: `pnpm lint && pnpm check && pnpm build` exit 0.

Final check, from a clean state, to prove nothing depends on stale generated output:

```bash
rm -rf node_modules .svelte-kit .content-collections && pnpm install && pnpm lint && pnpm check && pnpm build && pnpm vitest run --project=server
```

## Risks

- **Part 1 is unbounded.** Restoring `pnpm check` will surface type errors that have accumulated
  while it was broken. The count is unknown until the pin lands. If it is large, fixing those
  errors becomes its own piece of work rather than part of this one.
- **Pinning TypeScript to 6 is a deferral, not a resolution.** The Renovate rule must carry a
  comment explaining why, or it becomes permanent by accident.
- **Removing 27 packages at once** risks one of them being loaded by a mechanism the import scan
  did not cover (a Vite plugin resolving by name, a PostCSS convention). The per-package restore
  step above is the mitigation.
