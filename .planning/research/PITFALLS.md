# Pitfalls Research

Sources: Pretext `src/measurement.ts`, `src/layout.ts`, `tsconfig.json`, `package.json`, `RESEARCH.md`, `CLAUDE.md`; project `CLAUDE.md`; Next.js 16 App Router behavior.

---

## Critical Pitfalls

### 1. Canvas + SSR: Hard Throw on the Server

**Warning signs:**
- `Error: Text measurement requires OffscreenCanvas or a DOM canvas context.` in build logs or runtime server errors.
- Any import of Pretext reaching a Server Component, `generateMetadata`, `generateStaticParams`, or a Route Handler — all run Node.js, which has neither `OffscreenCanvas` nor `document`.
- `getMeasureContext()` in `src/measurement.ts` has no graceful fallback — it throws unconditionally when both checks fail.

**Why it bites hard:**
Next.js 16 App Router makes Server Components the default. A developer who writes `import { prepare } from '@chenglou/pretext'` in any RSC, layout file, or utility imported by one will explode at request time. The error is a throw, not a `null` return, so it kills the render.

Additionally, `measureContext` is a module-level variable (`let measureContext: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null = null`). In SSR there is no per-request isolation — a failed first call leaves `measureContext` null, and the next call throws again. There is no "Node-safe no-op" mode in the library.

**Prevention strategy:**
- All Pretext calls must live behind `'use client'` boundaries. Never import Pretext in a Server Component.
- In `hub/src/lib/pretext/`, create a single `usePretext` hook (client-only) that wraps `prepare()` and `layout()`. This is the only import surface for the rest of the app.
- Guard with `typeof window !== 'undefined'` or `useEffect` at the call site, not just at the import.
- For SSR placeholder sizing (e.g. skeleton heights), use CSS-based estimates — never call Pretext server-side.
- Add an eslint rule or comment convention to `hub/src/lib/pretext/` marking it `// CLIENT ONLY`.

**Phase:** Address in Phase 1 (integration layer scaffolding). Non-negotiable before any RSC wraps a memory card.

---

### 2. prepare() Called in a Render Loop

**Warning signs:**
- Jank or dropped frames when scrolling through memory content.
- React DevTools profiler shows `prepare()` being called on every render.
- `canvas.measureText()` calls visible in performance traces on every keystroke or resize.

**Why it bites hard:**
`prepare()` segments text via `Intl.Segmenter`, measures every word with canvas, and caches widths. It is described in the codebase as "expensive, one-time." `layout()` is "cheap, pure arithmetic — ~0.0002ms per text." The entire architecture is predicated on calling `prepare()` once per text string and `layout()` on every resize. Calling `prepare()` on every render (e.g. in the component body without memoization, or in a `useMemo` with wrong deps) destroys the performance model.

**Prevention strategy:**
- `useMemo(() => prepare(text, font), [text, font])` — deps must be stable strings, not object refs.
- Store `PreparedText` handles in a module-level `WeakMap` or a React context cache keyed by `(text, font)`.
- `layout()` goes in `useMemo` or `useCallback` with `[prepared, containerWidth, lineHeight]` deps.
- Do not call `prepare()` inside `useEffect` that re-fires on every render.
- The `clearMeasurementCaches()` and `clearAnalysisCaches()` exports exist for cleanup — call them only on unmount of the entire Pretext provider, not per-component.

**Phase:** Phase 1 (hook design). Establish the caching pattern before any component uses Pretext.

---

### 3. system-ui Font Trap

**Warning signs:**
- Text wraps differently in Pretext measurement vs visible DOM text at 10–12px, 14px, or 26px font sizes.
- Memory cards look correct at some sizes but have off-by-one-line errors at others.
- Tests pass on Linux CI but fail on macOS developer machines.

**Why it bites hard:**
This is a documented, measured Pretext limitation (RESEARCH.md: "Discovery: system-ui font resolution mismatch"). macOS resolves `system-ui` to SF Pro Text at smaller sizes and SF Pro Display at larger sizes. Canvas and DOM switch between these variants at **different** size thresholds. The mismatch clusters at 10-12px, 14px, and 26px — common UI font sizes. The library explicitly states: "use a named font if accuracy matters." There is no runtime fix — the practical conclusion from Pretext's own research was "keep `system-ui` documented as unsafe."

Tailwind's default font stack (`font-sans`) resolves to `system-ui, -apple-system, ...` on most platforms. If Hub components use Tailwind's default and pass that same font string to Pretext, measurement will be silently wrong on macOS.

**Prevention strategy:**
- Hub must use a named font (e.g. Inter loaded via `next/font/google`) everywhere Pretext measurement is needed.
- The font string passed to `prepare(text, font)` must exactly match the CSS `font` shorthand used in the DOM (e.g. `'16px Inter'` not `'16px system-ui'`).
- Create a `PRETEXT_FONT` constant in `hub/src/lib/pretext/fonts.ts` — single source of truth for both the CSS class and the Pretext font string.
- Never pass a CSS variable or `font-family` stack to `prepare()` — only resolved named fonts.
- If shadcn/ui components use `system-ui` internally, wrap them with a named font override when they also need Pretext measurement.

**Phase:** Phase 1 (font setup). Must be decided before any measurement code is written.

---

## Moderate Pitfalls

### 4. TypeScript Version Conflicts

**Warning signs:**
- Type errors in Hub when importing types from Pretext's `dist/layout.d.ts`.
- `moduleResolution: "bundler"` or `verbatimModuleSyntax` not recognized by Hub's TypeScript.
- `allowImportingTsExtensions` errors if Hub's `tsconfig.json` is mis-configured to look inside `pretext/src/` directly.

**Why it might cause issues:**
Pretext uses TypeScript 6.0.2 with flags that are TS 6-specific: `moduleResolution: "bundler"`, `allowImportingTsExtensions: true`, `verbatimModuleSyntax: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. Hub will use a different TypeScript version (likely TS 5.x, which is Next.js 16's supported range as of early 2026). These versions are not interoperable at the type-checker level.

Hub should only consume Pretext's **built** `dist/layout.d.ts` — not its source TypeScript. The `dist/` is generated by `tsconfig.build.json` which uses standard TS 5-compatible emit. But if Hub's `tsconfig.json` mistakenly includes `pretext/src/**` in its `include` paths, TS 6 syntax in Pretext source will cause Hub's compiler to fail or misinterpret types.

**Prevention strategy:**
- Hub `tsconfig.json` must reference Pretext only via the package path `@chenglou/pretext` pointing to `dist/`, never via a relative `../../pretext/src/` path.
- Use `paths` in Hub's `tsconfig.json`: `"@chenglou/pretext": ["../pretext/dist/layout.d.ts"]` (or point to the `package.json` exports).
- Run `bun run build:package` inside `pretext/` before Hub type-checks, or include this in a pre-check script.
- Hub's `tsconfig.json` `exclude` should explicitly exclude `../pretext/src`.
- Keep Pretext's `devDependencies.typescript` pinned — do not let Hub's npm accidentally upgrade it.

**Phase:** Phase 1 (project setup). Configure tsconfig paths before writing any integration code.

---

### 5. Git Submodule Workflow Pain

**Warning signs:**
- `import { prepare } from '@chenglou/pretext'` fails with module-not-found after a fresh clone.
- CI builds pass locally but fail on Vercel with missing `pretext/dist/` files.
- Team members get diverging behavior because they cloned without `--recurse-submodules`.
- `pretext/` shows as a detached HEAD with unexpected hash after a `git pull`.

**Why it might cause issues:**
Git submodules require explicit initialization (`git submodule update --init --recursive`) after cloning. This is a step developers and CI systems routinely forget. The Pretext submodule also needs `bun install` + `bun run build:package` to produce `dist/` before Hub can consume types or the built module. Vercel's build environment will clone the repo but may not run submodule init unless explicitly configured in the build command.

Additionally, since `dist/` is not checked in (it is in Pretext's `files` array for npm publish but generated at build time), the Hub cannot function without an explicit submodule build step.

**Prevention strategy:**
- Add a `scripts/setup.sh` (or `npm run setup` in Hub's `package.json`) that chains: `git submodule update --init --recursive && cd ../pretext && bun install && bun run build:package`.
- Vercel build command must include submodule init: `git submodule update --init --recursive && cd pretext && bun install && bun run build:package && cd ../hub && npm install && npm run build`.
- Add a `postinstall` hook in Hub's `package.json` that checks for `../pretext/dist/layout.js` and prints a clear error if missing.
- Document the setup sequence prominently in the project root `README.md` and `CLAUDE.md`.
- Pin the submodule to a specific commit hash — never leave it floating on a branch.

**Phase:** Phase 0 (project scaffolding). Must be correct before any developer onboards.

---

### 6. Font Loading Race Conditions

**Warning signs:**
- Pretext measures text correctly on second render but wrong on first load.
- Screenshots in CI show different line counts than in the browser.
- `prepare()` returns different results when called immediately vs after a 500ms delay.
- Text cards have wrong heights initially then "snap" into place after fonts load.

**Why it might cause issues:**
Pretext measures fonts via canvas `measureText()`. If the named font (e.g. Inter) has not been loaded by the browser when `prepare()` is first called, canvas falls back to a fallback font (usually a system sans-serif). The cached measurements are then wrong for the actual font. Unlike DOM measurement which re-measures on `fontfacechange`, Pretext's segment cache persists until explicitly cleared.

`next/font` injects font CSS and preloads font files, but the font may not be in the browser's font cache at the exact moment the first `useEffect` fires (which is when a client component can safely call `prepare()`).

**Prevention strategy:**
- Use `document.fonts.ready` before the first `prepare()` call: `await document.fonts.ready` inside a `useEffect` or as a one-time app-init step.
- Alternatively, call `document.fonts.load('16px Inter')` and await it before the Pretext provider initializes.
- `next/font` with `preload: true` (the default) reduces the window but does not eliminate it — still await `document.fonts.ready`.
- If a race is detected at runtime (e.g. by comparing canvas-measured width to a known reference string), call `clearMeasurementCaches()` and re-prepare.
- For Vercel deployments with CDN-cached font files, the race is shorter but still real on first cold load.

**Phase:** Phase 2 (memory content rendering). Address when first Pretext component is rendered in Hub.

---

### 7. Dual Package Manager Issues

**Warning signs:**
- `bun.lock` and `package-lock.json` conflict in git merge.
- `npm install` in the repo root accidentally walks into `pretext/` and installs its devDependencies via npm (breaking Bun-specific package resolution).
- CI systems that only have npm installed fail to build Pretext.
- `node_modules` inside `pretext/` is managed by npm instead of bun, breaking Bun's `@types/bun` types.

**Why it might cause issues:**
Two separate dependency trees (npm for Hub, bun for Pretext) work cleanly if scripts always `cd` into the right directory before running the right package manager. The risk is accidental cross-contamination: running `npm install` from the repo root with a workspace config that sweeps up `pretext/`, or a developer running `bun install` in `hub/`.

Bun's `bun.lock` and npm's `package-lock.json` are not interchangeable. Having both in git is fine as long as each stays in its own directory.

**Prevention strategy:**
- The repo root must have no `package.json` — do not make it an npm workspace or a bun workspace that includes both `hub/` and `pretext/`.
- Add a `.npmrc` in `pretext/` with `engine-strict=true` and an `engines.bun` field in `package.json` to warn developers who try `npm install` there.
- Add a `.bunrc` or equivalent in `hub/` to surface an error if bun is used there (or just document it clearly).
- CI configuration must explicitly use `bun install` for `pretext/` and `npm ci` for `hub/` — never a single command at the root.

**Phase:** Phase 0 (project scaffolding). Validate this is clean before writing any code.

---

## Low-Risk Pitfalls

### 8. Port Conflicts: Pretext :3000 vs Next.js :3000

**Warning signs:**
- `npm run dev` in Hub silently uses :3000 because the Next.js default was not overridden.
- `bun start` in Pretext and `npm run dev` in Hub are run simultaneously and one fails to bind.
- The Pretext `start` script (`PORT=3000; ...lsof -tiTCP:$PORT...`) aggressively kills whatever is on :3000, including Hub's dev server.

**Why it is low-risk:**
The Pretext `start` script already handles port conflicts by killing the existing process — but it will kill Hub's dev server if Hub is also on :3000. This is a developer experience issue, not a production issue (Vercel runs only Hub). It is solved with one config change.

**Prevention strategy:**
- Set Hub's dev port to 3001 in `hub/package.json`: `"dev": "next dev --port 3001"` or via `hub/.env.local`: `PORT=3001`.
- Document in CLAUDE.md: "Pretext dev server uses :3000, Hub uses :3001." (Already noted in project CLAUDE.md — ensure it is enforced in Hub's config.)
- For concurrent development, provide a root-level `dev` script: `concurrently "cd pretext && bun start" "cd hub && npm run dev"`.

**Phase:** Phase 0. One-line fix, low urgency but worth doing during scaffolding.

---

### 9. Bidi + CJK via Fast Path

**Warning signs:**
- Arabic or Hebrew memory content renders with wrong line breaks.
- Mixed LTR/RTL text in notes or conversation bubbles wraps incorrectly.
- No visible error — just subtly wrong layout.

**Why it is low-risk but worth knowing:**
Pretext's fast path (`prepare()` + `layout()`) does not expose bidi metadata. Bidi levels are only available on the rich path (`prepareWithSegments()` + `layoutWithLines()`). For simple height measurement of memory cards, the fast path is fine — bidi doesn't change line count in typical cases. But for any component that renders actual text runs (conversation bubbles, rich notes), using the wrong path produces incorrect RTL segment ordering.

**Prevention strategy:**
- Memory card height virtualization: use `prepare()` + `layout()` (fast path, bidi-safe for counting).
- Actual text rendering: use `prepareWithSegments()` + `layoutWithLines()` and consume the `bidiLevel` metadata to set `dir` on rendered spans.
- Document in `hub/src/lib/pretext/README.md` which hook uses which path and why.

**Phase:** Phase 3 (multilingual support). Not needed until RTL content is actually rendered.

---

### 10. OffscreenCanvas vs document.createElement('canvas') in Workers

**Warning signs:**
- Web Worker-based Pretext measurement (if attempted) works in Chrome but fails in Safari.
- `getMeasureContext()` uses `OffscreenCanvas` when available — this branch runs in workers and Chrome 69+, but `OffscreenCanvas` is not available in Safari until Safari 16.4 (and even then has limitations with `measureText`).

**Why it is low-risk:**
Hub is unlikely to use Web Workers for Pretext in early phases. But if performance needs push toward offloading `prepare()` to a worker, this becomes relevant.

**Prevention strategy:**
- If Web Workers are used, explicitly detect Safari's OffscreenCanvas limitations and fall back to main-thread measurement.
- For Hub's initial implementation, keep all Pretext calls on the main thread in `useEffect` — simpler and avoids this entirely.
- Note in the integration layer: "Worker offloading is out of scope until Safari OffscreenCanvas + measureText is verified."

**Phase:** Only relevant in a future performance optimization phase.

---

*Last updated: 2026-03-31*
