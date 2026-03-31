# Stack Research

_Last updated: 2026-03-31. Based on Next.js 16.1, React 19.2, Tailwind v4, shadcn/ui current._

---

## Recommended Stack

### Core Framework

| Package | Version | Rationale |
|---------|---------|-----------|
| `next` | `^16.1.0` | App Router is stable; React Compiler support is stable in 16; Turbopack is the default bundler. Breaking change from 15: `proxy.ts` replaces `middleware.ts`, all async request APIs (`cookies`, `headers`, `params`) require `await`. |
| `react` + `react-dom` | `^19.2.0` | Required peer of Next.js 16. React Compiler auto-memoizes components — valuable for Pretext integration where expensive `prepare()` calls must not re-run on layout passes. |
| `typescript` | `^5.8.x` (hub); `6.0.2` (pretext submodule) | Pretext itself is compiled with TS 6. The hub should stay on TS 5.x latest stable until TS 6 is the npm ecosystem default — the two compilations are independent (different `tsconfig.json` roots). |

### Pretext Integration Layer

**How to consume Pretext from the hub:**

Pretext ships built ESM from `dist/layout.js` + `dist/layout.d.ts` via its `exports` map. The submodule lives at `../pretext/` relative to `hub/`. The correct approach is a **TypeScript path alias** pointing directly at the submodule's TypeScript source for development (type-checked, no build step needed), combined with `transpilePackages` in `next.config.ts` so Turbopack/webpack compiles the ESM source through the hub's build pipeline.

```ts
// hub/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@pretext": ["../pretext/src/layout.ts"]
    }
  }
}
```

```ts
// hub/next.config.ts
const nextConfig = {
  transpilePackages: ['@chenglou/pretext'],
  experimental: {
    turbo: {
      resolveAlias: {
        '@pretext': '../pretext/src/layout.ts'
      }
    }
  }
}
```

This avoids running `bun build:package` every time Pretext source changes during development, while keeping the npm/bun boundary intact. In production, the hub builds Pretext source inline — no published package needed.

Alternative considered: use `npm link` or `file:` protocol. Rejected because Turbopack does not resolve symlinked packages outside the project root by default (confirmed in Next.js issue #82717). Path alias is more explicit and avoids symlink resolution problems.

### Canvas / SSR Boundary

Pretext's `prepare()` calls `canvas.measureText()` — unavailable on the server. Three patterns, each with a clear use case:

**Pattern 1: `'use client'` boundary (recommended for most components)**

```tsx
// hub/src/components/layout/TextBlock.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { prepare, layout } from '@pretext'

export function TextBlock({ text, font, maxWidth, lineHeight }) {
  const [height, setHeight] = useState<number | null>(null)

  useEffect(() => {
    const prepared = prepare(text, font)
    setHeight(layout(prepared, maxWidth, lineHeight).height)
  }, [text, font, maxWidth, lineHeight])

  return <div style={{ height: height ?? 'auto' }}>{text}</div>
}
```

Server renders the component with `height: auto` (no flash, correct fallback). Client hydrates and applies exact height after first paint. This is correct SSR behavior — no hydration mismatch because `useState` initial value matches server render.

**Pattern 2: `dynamic()` with `ssr: false` (for canvas-rendering demos)**

Use this only for components that must paint to a `<canvas>` element or depend on `window` APIs at module scope (e.g., the bubbles and dynamic-layout demos). `ssr: false` skips server render entirely; use a `Suspense` fallback as the loading state.

```tsx
import dynamic from 'next/dynamic'

const BubblesDemo = dynamic(
  () => import('@/components/demos/BubblesDemo'),
  { ssr: false, loading: () => <DemoSkeleton /> }
)
```

**Pattern 3: `useLayoutEffect` for synchronous pre-paint measurement**

For virtualized lists where height must be known before the browser paints (to avoid scroll-jump), use `useLayoutEffect` to call `layout()` synchronously after mount. This fires before paint but after DOM insertion, giving accurate `maxWidth` from the container ref.

```tsx
useLayoutEffect(() => {
  if (!containerRef.current) return
  const w = containerRef.current.offsetWidth
  const prepared = prepare(text, font)           // cache hit after first call
  setHeight(layout(prepared, w, lineHeight).height)
}, [text, font, lineHeight])
```

Note: `useLayoutEffect` suppresses SSR warnings in Next.js 16 App Router when inside a `'use client'` component.

### Virtualization

| Package | Version | Rationale |
|---------|---------|-----------|
| `@tanstack/react-virtual` | `^3.x` | The only viable choice for Pretext integration. Supports dynamic/variable item heights via `estimateSize` + `measureElement` callbacks. Pretext provides exact heights — pass them to `measureElement` after `layout()` returns. React-window is rejected (static heights only, unmaintained). React Virtualized is rejected (aging architecture, unmaintained). |

Integration pattern: TanStack Virtual's `estimateSize` returns Pretext's `layout()` height. When the container width changes (resize observer), recompute `layout()` for all visible items and call `virtualizer.measure()` to reflow. Because `layout()` is `~0.0002ms` per item, computing all items in a resize callback is safe even for thousands of items.

```tsx
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: (i) => {
    const item = items[i]
    if (!item.prepared) return 40  // fallback until prepare() runs
    return layout(item.prepared, containerWidth, LINE_HEIGHT).height
  },
  overscan: 5,
})
```

### UI Components and Styling

| Package | Version | Rationale |
|---------|---------|-----------|
| Tailwind CSS | `^4.x` | v4 is the current stable; required by shadcn/ui. OKLCH color space replaces HSL. No `tailwind.config.js` — configuration lives in `globals.css` via `@theme`. |
| shadcn/ui | current CLI (not a versioned package) | Component collection, not a dependency. Add components via `npx shadcn@latest add <component>`. Keep CLI-generated files in `components/ui/`; custom wrappers in `components/shared/`. |
| `next-themes` | `^0.4.x` | Class-based dark mode toggle. Inject `ThemeProvider` in the root layout. Add a blocking inline script in `<head>` to read `localStorage` and apply the theme class before render — prevents white flash. shadcn/ui dark mode works out of the box with this setup. |
| `tailwind-merge` + `clsx` | latest | Use `cn()` helper (re-exported by shadcn/ui setup) everywhere. Never concatenate Tailwind classes with template literals. |

Dark mode color tokens: shadcn/ui 2026 uses OKLCH throughout. Map brand colors to CSS custom properties in `globals.css` under `@layer base`. The `.dark` selector overrides the same tokens. Do not hardcode palette values inside component files.

### Data Fetching and State

| Package | Version | Rationale |
|---------|---------|-----------|
| Native `fetch` (Server Components) | — | EverMemOS FastAPI backend is a REST API. Fetch directly in Server Components for memory list/detail pages — no extra library needed, Next.js 16's `'use cache'` directive handles caching at the RSC layer. |
| `@tanstack/react-query` | `^5.x` | For client-side interactive features that need refetch, optimistic updates, or cache invalidation (e.g., live memory search, real-time profile updates). Do not use for static/SSR data that can be fetched in Server Components. |
| Zod | `^3.x` | Validate EverMemOS API responses at the boundary. Define schemas in `shared/` so both the hub and any future tooling share types. |

### Fonts

Use Inter via `next/font/google` with the `subsets: ['latin']` minimum. For CJK memory content, add Noto Sans SC / Noto Sans JP / Noto Sans KR lazily — do not bundle all CJK subsets by default.

**Never use `system-ui`** as the Pretext font argument. Canvas resolves `system-ui` to a different optical variant than the DOM on macOS, producing measurement inaccuracy. Use explicit font names: `'16px Inter'`, `'16px "Noto Sans SC"'`. This is documented in Pretext's `CLAUDE.md` and confirmed in `RESEARCH.md`.

---

## Integration Patterns

### The Two-Phase Pretext Model in React

Pretext's API maps cleanly to React's render/effect split:

- `prepare(text, font)` — **expensive, one-time per (text, font) pair.** Run in `useEffect` or `useLayoutEffect`, never in render. Cache results in a `useRef` map or a module-level `Map` keyed by `(text, font)`.
- `layout(prepared, maxWidth, lineHeight)` — **cheap, pure arithmetic.** Safe to call in a `useMemo` or even during render once `prepared` is available. Rerun on every resize via `ResizeObserver`.

```
Server Component                Client Component
      │                               │
      │  renders skeleton HTML        │  useEffect: prepare()
      │  (no canvas calls)            │  ResizeObserver: layout()
      └──────────────────────────────►│  setState(height)
                                      │  re-render with exact height
```

### ResizeObserver + Layout Loop

```tsx
'use client'
import { useEffect, useRef, useCallback } from 'react'
import { prepare, layout, type PreparedText } from '@pretext'

export function usePretextHeight(text: string, font: string, lineHeight: number) {
  const containerRef = useRef<HTMLDivElement>(null)
  const preparedRef = useRef<PreparedText | null>(null)
  const [height, setHeight] = useState<number>(0)

  // Prepare once per (text, font)
  useEffect(() => {
    preparedRef.current = prepare(text, font)
  }, [text, font])

  // Recompute height on resize
  const measure = useCallback(() => {
    if (!containerRef.current || !preparedRef.current) return
    const w = containerRef.current.offsetWidth
    const result = layout(preparedRef.current, w, lineHeight)
    setHeight(result.height)
  }, [lineHeight])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [measure])

  return { containerRef, height }
}
```

### Module-Level Prepare Cache

For lists with many repeated texts (e.g., short memory snippets), a module-level cache prevents redundant `prepare()` calls across component instances:

```ts
// hub/src/lib/pretext/cache.ts
import { prepare, type PreparedText } from '@pretext'

const cache = new Map<string, PreparedText>()

export function cachedPrepare(text: string, font: string): PreparedText {
  const key = `${font}::${text}`
  let hit = cache.get(key)
  if (!hit) {
    hit = prepare(text, font)
    cache.set(key, hit)
  }
  return hit
}
```

Pretext also maintains its own internal segment metrics cache (`Map<font, Map<segment, metrics>>`), so even if the module-level cache misses, repeated same-font `prepare()` calls benefit from cached canvas measurements.

### Demo Pages: `ssr: false` + Canvas Direct Draw

The bubbles and dynamic-layout demos write to a `<canvas>` element and run their own RAF loop. These must be:

1. In a `'use client'` component imported via `dynamic({ ssr: false })`
2. Wrapped in `<Suspense>` at the page level
3. Initialized in `useEffect` (not `useLayoutEffect`) since they don't need synchronous pre-paint measurement

### Submodule Build Boundary

The hub's `npm install` and `bun install` (in `pretext/`) are separate. The hub never depends on Pretext's `bun` runtime. Only Pretext's TypeScript source (under `pretext/src/`) is consumed by the hub via the path alias. The `pretext/dist/` output is publish-time only and is not used during hub development.

During hub `npm run build` (production), Next.js compiles `pretext/src/layout.ts` and its imports as part of the hub bundle via `transpilePackages`. Pretext has no runtime dependencies — its `devDependencies` are all build-time tools (`@types/bun`, `oxlint`, `tsgolint`, `typescript`). This means no `node_modules` hoisting conflicts.

---

## What NOT to Use

### react-window / react-virtualized

react-window requires fixed item heights. Pretext's entire value proposition is _accurate dynamic heights_. react-virtualized is unmaintained. Both are dead ends for this project.

### `system-ui` as the Pretext font argument

Canvas and DOM resolve `system-ui` to different optical variants on macOS, producing measurement errors. Always use named fonts. This is a hard constraint from Pretext's own documentation, not a preference.

### canvas-polyfills (node-canvas, jest-canvas-mock) in SSR

Do not attempt to polyfill `canvas` on the server via `node-canvas` or similar. The approach adds a native binary dependency, produces measurements that don't match any browser, and is unnecessary — the correct SSR pattern is to defer measurement to the client, not fake it on the server.

### `react-spring` or `framer-motion` for layout animations triggered by Pretext reflow

These libraries animate CSS properties and are unaware of Pretext's measurement cycle. A resize-triggered `layout()` call changes `height` synchronously — animating that with spring physics creates visual desync between the layout engine and the animation frame. Use CSS `transition: height` with a short duration (150–200ms) instead, applied only after the first measurement (to avoid animating the initial settle).

### `getServerSideProps` / Pages Router

The project targets the App Router exclusively. Do not introduce any Pages Router patterns (`getServerSideProps`, `getStaticProps`, `_app.tsx`). Next.js 16 supports both routers, but mixing them is a maintenance hazard.

### Webpack custom loaders for the Pretext submodule

Turbopack is the default bundler in Next.js 16. Custom webpack loaders for handling the submodule are a configuration smell — use `transpilePackages` + `resolveAlias` in Turbopack config instead. Only fall back to webpack configuration if a specific Turbopack feature gap forces it.

### `useEffect` for initial height measurement (use `useLayoutEffect` instead)

`useEffect` fires after paint. For virtualized lists, computing heights after paint produces a visible scroll-jump on initial render. Use `useLayoutEffect` (fires before paint) for the first `layout()` call. Use `useEffect` only for `prepare()` (which is async-safe and can run after paint since it doesn't affect scroll geometry).

### Bundling CJK font subsets into the hub build

Full Noto CJK subsets are 5–15MB each. Load them via `next/font` with the specific subsets needed for your memory content, or load them lazily when the user first encounters CJK content. Do not add them to the root layout unconditionally.

### `@tanstack/react-query` for static memory data

Data fetched once per page load with no mutation or real-time requirement belongs in a Server Component using `fetch()` + Next.js `'use cache'` directive. Adding React Query for this adds client bundle weight with no benefit.

---

## Confidence Levels

| Recommendation | Confidence | Notes |
|----------------|-----------|-------|
| Next.js 16.1 + React 19.2 | **High** | Released, stable, Next.js 16 upgrade guide is published. |
| Turbopack as default bundler | **High** | Default in Next.js 16; file system caching stable in 16.1. |
| `'use client'` + `useLayoutEffect` for Pretext measurement | **High** | Canonical SSR-safe pattern; matches Pretext's browser-only Canvas requirement. |
| `dynamic({ ssr: false })` for canvas-drawing demos only | **High** | Standard pattern; supported in Next.js 16. |
| `@tanstack/react-virtual` v3 for virtualization | **High** | Only actively-maintained React virtualizer with dynamic height support via `measureElement`. |
| Path alias + `transpilePackages` for submodule consumption | **High** | Documented in Next.js; confirmed approach for local TypeScript source. Turbopack `resolveAlias` required alongside. |
| TS 5.x (hub) + TS 6 (pretext) coexistence | **High** | Two separate `tsconfig.json` roots; no shared compilation. Hub's `tsc --noEmit` only sees hub sources. |
| Tailwind v4 + shadcn/ui + next-themes | **High** | shadcn/ui officially supports Tailwind v4; OKLCH color tokens are the 2026 default. |
| Module-level `prepare()` cache | **High** | Documented in Pretext's own CLAUDE.md as the required usage pattern. |
| Never use `system-ui` as font arg | **High** | Documented hard constraint in Pretext source and CLAUDE.md. |
| `@tanstack/react-query` for interactive client features only | **Medium** | Standard practice; boundary judgment depends on final feature set. |
| `useLayoutEffect` vs `useEffect` for initial measurement | **Medium** | Correct in theory; React 19 strict mode double-invokes effects — verify no double-prepare calls in dev. |
| CSS `transition: height` vs spring animation | **Medium** | Pragmatic; may need revisiting if complex animation is added to demos. |
| Zod for EverMemOS API response validation | **Medium** | Appropriate but can be deferred; EverMemOS API shape may not be finalized yet. |
| Lazy CJK font loading | **Medium** | Correct approach; implementation detail depends on memory content distribution. |
