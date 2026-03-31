# Research Summary

_Last updated: 2026-03-31_

---

## Recommended Stack (one-liner per choice)

- **Next.js 16.1 + React 19.2** — App Router stable, React Compiler auto-memoizes; middleware renamed to `proxy.ts`, all async APIs require `await`.
- **TypeScript 5.x (hub) / 6.x (pretext)** — independent compilation roots; hub never includes pretext/src in its tsconfig.
- **Pretext via path alias + `transpilePackages`** — consume `../pretext/src/layout.ts` directly; no `bun build:package` needed during dev.
- **`@tanstack/react-virtual` v3** — only maintained virtualizer with dynamic height via `measureElement`; react-window is dead.
- **Tailwind v4 + shadcn/ui + next-themes** — OKLCH color tokens, class-based dark mode, blocking inline script prevents white flash.
- **Native `fetch` in Server Components** — REST API data, cached with Next.js `'use cache'` directive.
- **`@tanstack/react-query` v5** — client-side only: live search, optimistic updates, refetch; not for static SSR data.
- **Zod v3** — validate EverMemOS API responses at the boundary; schemas in `shared/`.
- **Inter via `next/font/google`** — explicit named font, never `system-ui`; CJK subsets loaded lazily.

---

## Table Stakes Features

- Memory content display — conversations (turn-by-turn), episodes (timestamped), profiles (structured + prose) rendered as cards
- Full-text search + filter by type, date range, tags with matched-term highlighting
- Responsive layout — mobile (≥320px) through desktop; nav collapses; cards reflow to single-column
- Baseline text rendering — no overflow/clipping, correct CJK/emoji display, CSS `overflow-wrap` fallback
- Loading + error states — skeleton loaders (Suspense), `error.tsx`/`loading.tsx`, empty-state messaging
- Pagination — cursor-based, controlling memory lists of thousands of entries

---

## Differentiator Features

- **Virtualized memory lists with accurate height prediction** — Pretext `prepare()` + `layout()` gives exact heights before DOM creation; eliminates scroll jumps at 10k+ items
- **Masonry / editorial card layout** — column assignment computed before paint via Pretext heights; zero layout shift
- **Shrinkwrap text containers** — speech bubbles, labels sized pixel-tight around multi-line content without reflow
- **Multilingual rendering (CJK, Arabic, emoji, mixed-bidi)** — canvas measurement with explicit font strings matches DOM; `prepareWithSegments()` + `layoutWithLines()` for bidi metadata
- **Obstacle-aware text flow** — text routes around absolutely-positioned elements using `layoutWithLines()` + obstacle rects
- **Interactive Pretext demo pages** — bubbles, dynamic-layout, masonry showcases; port vanilla demos to Next.js; `ssr: false`

---

## Architecture Overview

### Component Boundaries

```
Server Components                Client Components
  fetch EverMemOS REST API   →     receive serializable props
  render structural shells         call Pretext prepare() / layout()
  pass plain props                 own ResizeObserver, canvas refs
```

Pretext calls `canvas.measureText()` — hard browser-only boundary. No Pretext import ever crosses into an RSC, layout file, or Route Handler.

### Data Flow

```
EverMemOS FastAPI → Server Component (fetch + cache) → Client Component
  → usePrepared(text, font)       [once per unique pair, module-level Map cache]
  → useContainerWidth(ref)        [ResizeObserver → debounced px width]
  → layout(prepared, width, lh)   [pure arithmetic, ~0.0002ms]
  → DOM render with exact height
```

`prepare()` is expensive (~0.1–1ms, canvas). `layout()` is free. Never call `prepare()` in a resize handler or render loop.

### Key Layer Map

```
hub/src/
├── app/**/page.tsx          Server — fetch data, pass props
├── components/memory/       Client ('use client') — Pretext-powered cards + lists
├── components/demos/        Client ('use client') — interactive showcases
├── lib/pretext/             Client-only — usePrepared, useLayout, useContainerWidth hooks
└── lib/api/                 Isomorphic — typed EverMemOS fetch wrappers
```

### Build Order

1. **Phase 0** — Repo scaffold: Next.js 16 on port 3001, tsconfig paths, dual package manager isolation, submodule init scripts, Vercel build command
2. **Phase 1** — Foundation: Pretext integration hooks (`usePrepared`, `useLayout`, `useContainerWidth`), EverMemOS API client, sandbox test page with single measured text block
3. **Phase 2** — Memory rendering: EpisodeCard, EpisodeList (virtualized), ProfileCard, KnowledgeBlock; end-to-end CJK/Arabic/emoji validation
4. **Phase 3** — Demos + polish: BubblesDemo, MasonryDemo, DynamicLayoutDemo; dark mode, mobile, skeletons, error states

---

## Critical Pitfalls (top 5)

1. **Canvas throws on the server** — `prepare()` throws unconditionally when `OffscreenCanvas`/`document` is absent; a single Pretext import in an RSC kills the render. Prevention: all Pretext lives behind `'use client'`; `usePrepared` is the only import surface; add ESLint rule marking `lib/pretext/` CLIENT ONLY. Address in Phase 1.

2. **`prepare()` called in a render loop** — performance model collapses if `prepare()` runs on every render or in a resize handler. Prevention: `useMemo([text, font])` or module-level `Map` cache; `layout()` in resize handler only; never call `clearMeasurementCaches()` per-component. Address in Phase 1 hook design.

3. **`system-ui` font trap** — macOS resolves `system-ui` to different optical variants for canvas vs DOM at 10–12px, 14px, 26px; measurements are silently wrong. Prevention: one `PRETEXT_FONT` constant (`'16px Inter'`), never a CSS variable or font stack, in both CSS class and `prepare()` argument. Address in Phase 1 font setup.

4. **TypeScript version conflicts** — Pretext uses TS 6.0.2 with TS-6-only flags; hub tsconfig must reference `dist/layout.d.ts` not `pretext/src/**`; run `bun run build:package` before Hub type-checks. Hub `tsconfig.json` must explicitly exclude `../pretext/src`. Address in Phase 0/1.

5. **Git submodule workflow pain** — fresh clones without `--recurse-submodules` + `bun build:package` produce missing `dist/`; Vercel build silently fails. Prevention: `scripts/setup.sh` chains submodule init + bun build; Vercel build command includes the full sequence; `postinstall` hook warns on missing `dist/layout.js`. Address in Phase 0.

---

## Key Decisions Made During Research

- **No canvas SSR polyfill** — `node-canvas` is a native binary, measures differently from browser canvas, complicates Vercel. Skeleton-first SSR is the correct pattern.
- **Path alias over `npm link`** — Turbopack does not resolve symlinked packages outside the project root (Next.js issue #82717). `transpilePackages` + Turbopack `resolveAlias` is explicit and reliable.
- **`useLayoutEffect` for initial height measurement** — `useEffect` fires after paint; initial layout in `useEffect` causes visible scroll-jump. Use `useLayoutEffect` for `layout()`, `useEffect` for `prepare()` (async-safe).
- **`@tanstack/react-virtual` only** — react-window requires fixed heights; react-virtualized is unmaintained. No alternatives exist for Pretext's dynamic-height model.
- **No global state for Pretext** — `PreparedText` handles are local; module-level singleton `Map` in `usePrepared.ts` survives unmount/remount without re-preparing — better than React context or global store.
- **Bidi / CJK path split** — height virtualization uses fast `prepare()` path; actual rendered text with RTL uses `prepareWithSegments()` + `layoutWithLines()` for `bidiLevel` metadata.
- **No offline caching, no rich media, no editor** — EverMemOS memory is agent-written and text-only; these features have no product requirement and carry high risk of scope creep.
- **`document.fonts.ready` guard** — `next/font` preloads fonts but does not guarantee canvas font resolution at first `useEffect`; `prepare()` must await `document.fonts.ready` to avoid measuring against a fallback font and caching wrong widths.
