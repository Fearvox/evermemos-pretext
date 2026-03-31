# Architecture Research

*Last updated: 2026-03-31*

---

## Component Boundaries

### The Core Split: Canvas Blocks SSR

Pretext's `prepare()` calls `canvas.measureText()` internally — a browser-only API. This creates a hard boundary: anything that touches Pretext must be a Client Component. Server Components can fetch data and pass it down as props, but must never import or call Pretext functions.

```
Server Components (can run on server/edge)
  └── fetch EverMemOS REST API
  └── render structural shells (page layout, nav, headings)
  └── pass raw memory data as serializable props

Client Components (browser only)
  └── receive data props from server
  └── call Pretext prepare() / layout()
  └── own all resize listeners, canvas refs, RAF scheduling
```

### Layer Map

```
hub/src/
├── app/
│   ├── layout.tsx                  # Server: root shell, nav, theme
│   ├── page.tsx                    # Server: hub home (static shell)
│   ├── memories/
│   │   ├── page.tsx                # Server: fetch episodes list → pass to client
│   │   └── [id]/page.tsx           # Server: fetch single episode → pass to client
│   ├── profiles/
│   │   └── page.tsx                # Server: fetch profiles → pass to client
│   └── demos/
│       ├── bubbles/page.tsx        # Thin Server shell, loads Client demo
│       ├── masonry/page.tsx
│       └── dynamic-layout/page.tsx
│
├── components/
│   ├── memory/                     # CLIENT — all Pretext-powered
│   │   ├── EpisodeCard.tsx         # Single episode rendered via Pretext layout
│   │   ├── EpisodeList.tsx         # Virtualized list of EpisodeCards
│   │   ├── ProfileCard.tsx         # User/agent profile visualization
│   │   └── KnowledgeBlock.tsx      # Knowledge entry with text layout
│   ├── demos/                      # CLIENT — interactive Pretext showcases
│   │   ├── BubblesDemo.tsx         # Port of bubbles.ts + bubbles-shared.ts
│   │   ├── MasonryDemo.tsx         # Port of masonry demo
│   │   └── DynamicLayoutDemo.tsx   # Port of dynamic-layout.ts (obstacle routing)
│   └── ui/                         # Shared shadcn/ui primitives (can be server or client)
│
└── lib/
    ├── pretext/                    # Pretext integration layer (CLIENT only)
    │   ├── usePrepared.ts          # Hook: memoize prepare() by [text, font]
    │   ├── useLayout.ts            # Hook: call layout() on containerWidth change
    │   ├── usePreparedWithSegments.ts  # Hook: memoize prepareWithSegments()
    │   └── useContainerWidth.ts    # Hook: ResizeObserver → stable px width
    └── api/                        # Data fetching (can be server or client)
        ├── evermemos.ts            # Typed fetch wrappers for EverMemOS REST API
        └── types.ts                # Shared TypeScript types for API responses
```

### What Is Server vs Client

| File | Boundary | Reason |
|------|----------|--------|
| `app/**/page.tsx` | Server by default | Fetch data, no interactivity needed at page level |
| `components/memory/*.tsx` | Client (`'use client'`) | Uses Pretext hooks → needs canvas |
| `components/demos/*.tsx` | Client (`'use client'`) | Interactive, canvas-dependent |
| `lib/pretext/*.ts` | Client (imported by client components) | canvas measureText is browser-only |
| `lib/api/evermemos.ts` | Isomorphic | Pure fetch; works in both Server Components and client hooks |
| `components/ui/*.tsx` | Server or client depending on shadcn component | Most shadcn primitives are client; pure display ones can be server |

**Key rule**: Server Components pass only serializable props to Client Components — plain objects, strings, numbers, arrays. No Pretext types, no Refs, no canvas handles cross this boundary.

---

## Data Flow

### Primary Flow: Memory Rendering

```
EverMemOS FastAPI
  │  GET /api/v1/episodes
  │  GET /api/v1/profiles
  │  GET /api/v1/knowledge
  ↓
Server Component (app/memories/page.tsx)
  │  fetch() at render time, cache with Next.js revalidation
  │  shape into typed props (Episode[], Profile[], etc.)
  ↓
Client Component (components/memory/EpisodeList.tsx)
  │  receives Episode[] as prop
  │  calls usePrepared(episode.content, FONT) → PreparedText (memoized)
  │  calls useContainerWidth(ref) → containerWidth (ResizeObserver)
  │  calls layout(prepared, containerWidth, LINE_HEIGHT) → { height, lineCount }
  ↓
DOM render
  - container div sized to computed height (no DOM reflow guesswork)
  - text rendered in positioned spans or canvas overlay depending on mode
```

### Prepare / Layout Split (Critical for Performance)

`prepare()` is expensive (~0.1–1ms depending on text length and font, requires canvas). `layout()` is free (pure arithmetic, ~0.0002ms). The integration layer must enforce this split:

```
Mount / text change → usePrepared() → memoize by (text, font) key
                                        stores PreparedText in a ref/map

Resize / containerWidth change → useLayout() → reads cached PreparedText
                                                calls layout() (pure, cheap)
                                                updates height state → re-render
```

`prepare()` must NEVER be called inside a RAF or resize handler. `layout()` can be called freely in both.

### Demo Data Flow

Demos are self-contained — they use hardcoded or randomly generated text, not the EverMemOS API. Their data flow is simpler:

```
DemoPage (Server shell, thin)
  ↓
DemoComponent (Client, 'use client')
  │  initialize text corpus (hardcoded or generated)
  │  prepareWithSegments() on mount (memoized)
  │  walkLineRanges() / layoutNextLine() on resize/interaction
  ↓
Canvas or positioned-div rendering
```

### EverMemOS Memory Types → Visual Rendering

| Memory type | API endpoint (assumed) | Visual component | Pretext API used |
|-------------|------------------------|------------------|------------------|
| Episode (conversation turn) | `/episodes` | `EpisodeCard` | `prepareWithSegments` + `layoutWithLines` (rich, bidi for multilingual) |
| Profile (user/agent profile) | `/profiles` | `ProfileCard` | `prepare` + `layout` (fast path, mostly ASCII) |
| Knowledge entry | `/knowledge` | `KnowledgeBlock` | `prepare` + `layout` or `prepareWithSegments` depending on language |

Bidi / CJK memory content must use the `prepareWithSegments()` rich path. Pure ASCII / Latin content can use the cheaper `prepare()` fast path.

---

## Build Order

### Phase 1: Foundation

Dependencies: nothing external; this is the scaffold.

1. **Next.js 16 scaffold** (`hub/`)
   - App Router, TypeScript, Tailwind, shadcn/ui
   - `next.config.ts`: set `port: 3001` (Pretext dev server owns 3000)
   - `transpilePackages`: include Pretext submodule path so Next.js can compile its TypeScript
   - Dark mode config, base layout, nav shell

2. **Pretext integration layer** (`hub/src/lib/pretext/`)
   - `useContainerWidth.ts`: ResizeObserver hook, returns stable debounced px width
   - `usePrepared.ts`: memoizes `prepare(text, font)` — calls it once per unique (text, font) pair, stores result in a `Map` ref, never re-prepares unless text or font changes
   - `usePreparedWithSegments.ts`: same but for `prepareWithSegments()`
   - `useLayout.ts`: takes a `PreparedText` handle + `containerWidth` + `lineHeight`, calls `layout()`, returns `{ height, lineCount }`
   - SSR guard: all hooks must check `typeof window !== 'undefined'` before calling any Pretext function

3. **EverMemOS API client** (`hub/src/lib/api/`)
   - TypeScript types for `Episode`, `Profile`, `KnowledgeEntry` from API response shapes
   - `fetchEpisodes()`, `fetchProfiles()`, `fetchKnowledge()` — thin fetch wrappers with `next: { revalidate }` cache headers

**Phase 1 exit criterion**: `usePrepared` + `useLayout` render a single hardcoded text block at the correct measured height in a minimal `app/sandbox/page.tsx` test page. No API calls yet.

### Phase 2: Memory Rendering

Dependencies: Phase 1 complete (integration layer + API client exist).

1. **Server pages** fetch from EverMemOS API and pass typed props to client components
2. **`EpisodeCard`**: renders a single conversation episode; uses `usePreparedWithSegments` for rich multilingual layout
3. **`EpisodeList`**: virtualized list (use `EpisodeCard` with measured heights); ResizeObserver at list level
4. **`ProfileCard`**: fast path (`usePrepared`) — profiles are typically short ASCII-heavy strings
5. **`KnowledgeBlock`**: fast path or rich path depending on detected language content
6. **Integration smoke test**: full end-to-end from API fetch → Pretext layout → correct pixel heights

**Phase 2 exit criterion**: Memory data from EverMemOS renders visually correctly for CJK, Arabic, emoji, and mixed content at multiple viewport widths.

### Phase 3: Demos and Polish

Dependencies: Phase 1 complete (demos only need integration layer, not EverMemOS API).

1. **`BubblesDemo`**: port `bubbles.ts` + `bubbles-shared.ts` to React; replace direct DOM manipulation with React state; use `usePreparedWithSegments` + `walkLineRanges` for shrinkwrap widths
2. **`MasonryDemo`**: port masonry demo; use `useLayout` to measure heights for column assignment
3. **`DynamicLayoutDemo`**: port `dynamic-layout.ts` — most complex, uses `layoutNextLine()` for obstacle-aware flow; keep the SVG hull logic in a separate `lib/pretext/hull.ts` utility
4. **Polish**: dark mode, mobile responsive, loading skeletons, error states
5. **Demo index page** at `/demos` listing all three showcases

**Phase 3 exit criterion**: All three demos interactive and visually matching Pretext standalone demo site behavior.

---

## Key Architectural Decisions

### SSR Strategy

**Decision**: Skeleton-first SSR, hydrate with Pretext on client.

Server Components render structural shells with placeholder heights (or `min-height` skeletons). On hydration, Client Components call `prepare()` once, then `layout()` to compute true heights. This avoids layout shift being worse than a skeleton — a wrong height from a server guess would cause more visual disruption than a clean skeleton-to-content transition.

**Alternative considered**: Canvas SSR polyfill (e.g., `node-canvas`). Rejected because: (1) `node-canvas` is a native module, complicates Vercel deployment; (2) font metrics differ between `node-canvas` and browser canvas on the same system, defeating the purpose of Pretext's accuracy; (3) skeletons are standard UX for dynamic content anyway.

**Implementation**: Client components use `useEffect` for the first `prepare()` call. Before hydration completes, they render a skeleton div. After hydration and `prepare()` completes, they render the measured content.

### State Management

**Decision**: No global state library. Colocate Pretext state in hooks, API state in Server Components + SWR/React Query for client-side refreshes.

Rationale: Pretext state (`PreparedText` handles) is local to each text block — there is no useful sharing across components. A global store for Pretext would add complexity with no benefit. For EverMemOS API data: Server Components handle the initial fetch; if live refresh is needed, add SWR at the client component level only where needed.

The `prepare()` memoization cache (the `Map<string, PreparedText>` inside `usePrepared`) lives in a module-level singleton, not React state, so it survives component unmount/remount without re-preparing. This is the most important performance optimization in the integration layer.

### Caching

| What | Where cached | Invalidated when |
|------|-------------|-----------------|
| `PreparedText` handles | Module-level `Map<textFont, PreparedText>` in `usePrepared.ts` | Font changes, `clearMeasurementCaches()` call |
| EverMemOS API responses | Next.js `fetch` cache with `revalidate` | Time-based or on-demand revalidation |
| `layout()` results | React state in `useLayout.ts` | `containerWidth` changes |
| ResizeObserver reads | Debounced in `useContainerWidth.ts` | Raw resize events |

### Font Handling

**Decision**: Preload all fonts used by Pretext before calling `prepare()`.

Pretext measures with whatever font the canvas resolves at call time. If `document.fonts.ready` has not resolved, `prepare()` will measure against a fallback font and produce wrong widths. The `usePrepared` hook must await `document.fonts.ready` before calling `prepare()`.

**`system-ui` is forbidden** for Pretext measurement. Canvas and DOM resolve `system-ui` to different optical variants on macOS (e.g., `-apple-system` at one weight vs another), causing width mismatches. Use explicit named fonts: `Inter`, `Helvetica Neue`, etc.

### Submodule Import in Next.js

Pretext ships `dist/layout.js` as its published main. In the submodule case (no npm publish), Next.js must be configured to compile Pretext's TypeScript source directly:

```ts
// next.config.ts
const nextConfig = {
  transpilePackages: ['@chenglou/pretext'],
  // resolve the submodule path to the src/ entry:
  webpack(config) {
    config.resolve.alias['@chenglou/pretext'] = 
      path.resolve(__dirname, '../pretext/src/layout.ts')
    return config
  },
}
```

This imports the raw TypeScript source from the submodule and lets Next.js + SWC compile it, avoiding the need to run `bun run build:package` before every Hub dev session. The `bun`/`npm` dual package manager boundary is preserved — Pretext's Bun scripts run independently; Hub only imports its TypeScript source.

### Resize Handling

`layout()` is the resize hot path. The `useContainerWidth` hook uses a `ResizeObserver` with a `requestAnimationFrame` debounce — one RAF per resize event burst. `useLayout` reads the latest container width from that hook and calls `layout()` synchronously (it is pure arithmetic, ~0.0002ms). This keeps resize updates within a single frame with no additional async overhead.

### Demo Port Strategy

Pretext demos use vanilla TypeScript with direct DOM manipulation and no framework. Porting to React means replacing:
- `document.getElementById` → React refs
- Direct style mutations → React state + className
- Event listeners → React event handlers
- `bun start` server → Next.js page route

The core Pretext calls (`prepare`, `layout`, `walkLineRanges`, `layoutNextLine`) are identical — they are pure functions with no framework dependency. The demo port work is primarily the rendering layer, not the layout logic.

For the `DynamicLayoutDemo` (obstacle routing), the hull geometry utilities (`wrap-geometry.ts`) can be copied as-is into `hub/src/lib/pretext/hull.ts` since they have no DOM dependencies — they are pure math over arrays of points.
