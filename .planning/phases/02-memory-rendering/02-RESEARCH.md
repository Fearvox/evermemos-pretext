# Phase 2: Memory Rendering — Research

## Research Summary

Phase 2 transforms the Hub from a sandbox demo into a functional memory browser. The work spans eight areas: EverMemOS API integration (mocked first, wired later), virtualized scrolling with Pretext-driven heights, three card component types (Episode, Profile, Knowledge), multilingual/bidi rendering, search and filtering, cursor-based pagination, and Next.js 16 routing. The existing Pretext hooks from Phase 1 (`usePrepared`, `useLayout`, `useContainerWidth`, `usePreparedWithSegments`) provide a solid foundation — the primary new engineering challenges are (1) feeding Pretext heights into @tanstack/react-virtual's dynamic sizing model, (2) the shrinkwrap bubble layout for episode conversations, and (3) creating a `shared/` directory for Zod schemas and API client that does not yet exist.

---

## 1. EverMemOS API Surface

### Findings

The 02-CONTEXT.md references the EverMemOS API at `https://docs.evermind.ai/api-reference/introduction` and the source repo at `https://github.com/EverMind-AI/EverMemOS`. Decision D-05 explicitly mandates **local JSON mock data** during development with a `useMock` flag, so the initial implementation does not depend on a live API.

Decision D-06 specifies the structure: Zod schemas and API client live in `shared/types/` and `shared/api/`. The `shared/` directory **does not exist yet** — it must be created.

Decision D-07 says to follow EverMemOS's official API docs for endpoint paths, request/response shapes, and pagination format.

Based on EverMemOS's documented architecture (Python FastAPI, LangChain, multi-tenant), the expected memory types are:
- **Episodes**: Conversation turns with user/agent roles, timestamps, content
- **Profiles**: User or agent profiles with structured fields + prose description
- **Knowledge**: Knowledge graph entries with subject-predicate-object or freeform text

Cursor-based pagination is the expected pattern (common in FastAPI projects for large datasets).

### Implications for Planning

1. **Mock data first**: Create `hub/src/lib/mock/` with fixture files for all three memory types. Include multilingual content (English, Chinese, Japanese, Arabic, emoji, mixed-bidi) per D-05.
2. **Zod schemas in shared/**: Define `Episode`, `Profile`, `KnowledgeEntry` schemas with inferred TypeScript types. Include pagination envelope type (`{ data: T[], cursor: string | null, hasMore: boolean }`).
3. **API client with mock toggle**: `shared/api/client.ts` with a `useMock` flag. When mocked, returns fixture data. When live, fetches from the FastAPI backend.
4. **The EverMemOS API docs should be consulted during planning** to finalize the exact response shapes. If docs are unavailable, the mock schemas should be designed to be easily updated.

### Risks / Unknowns

- **API docs may be incomplete or different from expectations.** Mitigation: mock-first approach means we are not blocked.
- **Pagination format is assumed** (cursor-based). If EverMemOS uses offset-based, the pagination layer needs adjustment.
- **Authentication is out of scope** (per REQUIREMENTS.md), but API requests may fail without auth headers. The mock toggle sidesteps this.

---

## 2. @tanstack/react-virtual v3 Integration with Pretext

### Findings

`@tanstack/react-virtual` is **not yet installed** — `hub/package.json` has no virtualizer dependency. It must be added: `npm install @tanstack/react-virtual`.

The v3 API centers on the `useVirtualizer` hook:

```ts
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: (index) => estimatedHeight, // initial estimate
  overscan: 5,
})
```

The key integration point with Pretext is **dynamic row heights**. The pattern:

1. Each card component calls `usePrepared()` + `useLayout()` to get the exact Pretext height.
2. The virtualizer's `measureElement` callback is attached to each card's DOM ref to report the actual rendered height back to the virtualizer.
3. Alternatively, since Pretext provides **exact heights before rendering** (via `layout()` pure arithmetic), we can set `estimateSize` to return the Pretext-computed height directly, avoiding post-render measurement entirely.

**The Pretext-first approach is superior**: `layout()` is ~0.0002ms per call (pure arithmetic, no DOM). We can compute all visible item heights upfront rather than relying on `measureElement` post-render DOM reads. This eliminates scroll-jump artifacts that occur when estimated heights differ from actual heights.

However, there is a subtlety: Pretext height computation requires `prepare()` which is async (awaits `document.fonts.ready`). Until prepared data is available, we need a reasonable `estimateSize` fallback.

### Implications for Planning

1. **Install `@tanstack/react-virtual` v3** as a dependency.
2. **Pre-compute heights**: When memory data loads, batch-prepare all visible texts, then feed exact heights to `estimateSize`.
3. **Fallback estimate**: Before `prepare()` completes, use a heuristic estimate (e.g., `Math.ceil(text.length / charsPerLine) * lineHeight + padding`).
4. **Height cache**: Maintain a `Map<string, number>` of item ID to computed height. Update when container width changes (Pretext `layout()` is cheap on resize).
5. **Compact/expanded toggle** (D-02): When toggled, recalculate heights for all items — compact truncates at N lines, expanded uses full text. This should trigger virtualizer `measure()` to refresh.

### Risks / Unknowns

- **Batch prepare() for 1,000+ items**: `prepare()` is expensive (~ms per text). For 1,000 items on initial load, this could be 1-2 seconds. Mitigation: prepare only the visible window + overscan (e.g., 20-30 items), then prepare additional items as user scrolls.
- **Width changes**: On resize, all `layout()` calls re-run (cheap), but the virtualizer must be notified of all height changes. This should work via `virtualizer.measure()`.

---

## 3. Existing Pretext Hooks

### Findings

Phase 1 built four hooks in `hub/src/lib/pretext/`:

| Hook | Purpose | API | Cache |
|------|---------|-----|-------|
| `usePrepared(text, font)` | Fast path — opaque handle | `{ prepared, isLoading }` | Module-level `Map<string, PreparedText>` |
| `useLayout(prepared, width, lineHeight)` | Pure arithmetic height | `LayoutResult \| null` | None (useMemo) |
| `useContainerWidth(ref)` | ResizeObserver width | `number` | None |
| `usePreparedWithSegments(text, font)` | Rich path — segments, bidi | `{ prepared, isLoading }` | Module-level `Map<string, PreparedTextWithSegments>` |

Constants: `PRETEXT_FONT = '16px Inter'`, `PRETEXT_LINE_HEIGHT = 24`.

The hooks follow the pattern demonstrated in `SandboxBlock.tsx`:
1. Get container width via `useContainerWidth(ref)`
2. Prepare text via `usePrepared(text, PRETEXT_FONT)`
3. Layout via `useLayout(prepared, width, PRETEXT_LINE_HEIGHT)`

**Key observations:**
- The `usePrepared` hook handles one text at a time. For the memory list (many items), each card would independently call `usePrepared()`. The module-level cache prevents re-preparation, but the async `document.fonts.ready` await happens once globally — subsequent calls resolve synchronously from cache.
- `useLayout` returns `{ height, lineCount }` — exactly what the virtualizer needs for row height.
- `usePreparedWithSegments` is needed only for episode bubble cards (shrinkwrap requires `walkLineRanges()` which takes `PreparedTextWithSegments`).

### Implications for Planning

1. **No new hooks needed for basic card rendering** — the existing four cover the use case.
2. **New hook needed: `useWalkLineRanges`** or a utility function wrapping `walkLineRanges()` for bubble shrinkwrap width calculation.
3. **New hook needed: `useLayoutWithLines`** for episode cards that need per-line text content for rendering conversation turns.
4. **Consider a batch hook**: `usePreparedBatch(texts[], font)` that prepares multiple texts in one effect cycle, reducing React re-render overhead for the memory list.
5. **The `usePreparedWithSegments` cache and `usePrepared` cache are separate** — a text prepared with both hooks is stored twice. This is documented and intentional.

### Risks / Unknowns

- **Per-card hook invocation scaling**: With 20-30 visible items + overscan, each calling `usePrepared` + `useLayout`, React manages ~60 hook instances. This should be fine — `usePrepared` cache hits are synchronous after first load, and `useLayout` is a `useMemo`.
- **Cache memory**: Module-level Maps grow unboundedly. For 1,000+ unique texts, this could be significant. Consider an LRU eviction strategy for production.

---

## 4. Card Component Architecture

### Findings

Three card types are needed per the context decisions:

#### Unified Card Shell (D-01)
All cards share: rounded corners, border, dark background, type badge (Episode=blue, Profile=emerald, Knowledge=amber). This maps to a `MemoryCard` wrapper component.

#### EpisodeCard (D-03) — Bubble Chat Layout
- User messages left-aligned, Agent messages right-aligned, wrapped in bubbles.
- Shrinkwrap via `walkLineRanges()` — the Pretext bubbles demo (`pretext/pages/demos/bubbles-shared.ts`) shows the exact pattern:
  1. `prepareWithSegments(text, font)` for each message
  2. `collectWrapMetrics(prepared, maxWidth)` — walks line ranges to find `maxLineWidth`
  3. `findTightWrapMetrics(prepared, maxWidth)` — binary search for tightest width that doesn't increase line count
  4. Bubble width = `Math.ceil(tightMetrics.maxLineWidth) + padding`
- The binary search in `findTightWrapMetrics` uses `layout()` (fast path) for the search, then `walkLineRanges()` (rich path) only for the final measurement. This is efficient.
- Bubble max width = 80% of container width (per the demo's `BUBBLE_MAX_RATIO = 0.8`).

#### ProfileCard (D-02)
Structured fields (name, role, description) + prose sections. Relatively straightforward — each text block measured with `usePrepared` + `useLayout`.

#### KnowledgeBlock (D-02)
Knowledge entries with text content. Similar to ProfileCard — Pretext measures the content block.

#### Compact/Expanded Toggle (D-02)
- Compact: 3-4 line preview + metadata. Pretext measures truncated text (first N characters or lines).
- Expanded: full content. Pretext measures full text.
- Toggle affects height → virtualizer must re-measure.

### Implications for Planning

1. **Port `findTightWrapMetrics` and `collectWrapMetrics` from the Pretext demo** into `hub/src/lib/pretext/` as utility functions. These are not hooks — they're pure functions that take a `PreparedTextWithSegments` and return metrics.
2. **EpisodeCard is the most complex component** — it needs per-message prepare, per-message shrinkwrap, alternating alignment. Plan it as its own sub-task.
3. **MemoryCard wrapper** should handle: type badge, compact/expanded toggle, border/padding, click-to-navigate behavior.
4. **Compact mode truncation**: Use text truncation (e.g., first 200 chars + "...") rather than CSS line-clamp — Pretext needs to know the actual text to measure correctly.

### Risks / Unknowns

- **Episode card height**: An episode with many conversation turns requires preparing each turn's text separately. A 20-turn conversation = 20 `prepareWithSegments()` calls + 20 shrinkwrap binary searches. This could be expensive on initial render. Mitigation: lazy-prepare as items scroll into view.
- **Shrinkwrap accuracy**: The binary search assumes `layout()` is monotonic (wider width = same or fewer lines). This is guaranteed by Pretext's CSS-matching line-break behavior.

---

## 5. Multilingual / Bidi Rendering

### Findings

Pretext already handles the hard parts:
- **CJK**: Per-character breaking via `Intl.Segmenter`, kinsoku rules (line-start/end prohibition) merged into segments during `prepare()`.
- **Arabic/RTL**: Bidi levels available on the `prepareWithSegments()` path. `segLevels: Int8Array | null` on the prepared handle. Layout/line-breaking itself does not read bidi levels — they're metadata for custom rendering.
- **Emoji**: Auto-detected correction per font size (Chrome/Firefox canvas measure emoji wider than DOM at <24px on macOS).
- **Mixed scripts**: Handled seamlessly by `Intl.Segmenter` word boundaries.

From `pretext/CLAUDE.md`:
- Bidi levels are only on the `prepareWithSegments()` path, not the fast `prepare()` path.
- CJK requires `Intl.Segmenter` with grapheme granularity for astral ideographs beyond BMP.
- Emoji measurement has auto-correction — don't assume fixed emoji widths.
- `system-ui` font is unsafe — this is already handled by `PRETEXT_FONT = '16px Inter'`.

**For rendering bidi content**, the application layer must use `segLevels` to determine text direction per segment. The Pretext library measures correctly regardless of direction, but **visual rendering** (which direction characters appear) requires the application to apply CSS `direction: rtl` or use the bidi levels for segment-by-segment rendering.

### Implications for Planning

1. **Most multilingual rendering works out of the box** — Pretext handles measurement, the browser handles rendering via the DOM's native bidi algorithm.
2. **Episode bubbles with Arabic text**: Use `usePreparedWithSegments` (already planned) — it provides both the segment arrays for shrinkwrap and the bidi metadata.
3. **CJK font loading** (deferred from Phase 1 D-05): Inter does not contain CJK glyphs. The browser will fall back to system CJK fonts. Pretext's canvas measurement will use the same fallback font the browser uses, so measurements stay correct. Explicit CJK font loading is an optimization, not a correctness requirement.
4. **Mock data must include**: English, Chinese (simplified + traditional), Japanese, Arabic, emoji (including ZWJ sequences), and mixed-script text. This is explicitly required by D-05.

### Risks / Unknowns

- **RTL bubble alignment**: Episode cards with Arabic text need right-to-left bubble alignment. The current left/right split is by role (user=left, agent=right). RTL content in a left-aligned bubble should still render correctly via the browser's bidi algorithm, but visual testing is essential.
- **Font fallback measurement accuracy**: If the browser falls back to different CJK fonts between canvas and DOM, measurements could drift. `Inter` is safe (per CLAUDE.md), but we should test CJK content in the sandbox before building cards.
- **Emoji ZWJ sequences**: Pretext handles these, but rendering in the DOM depends on platform emoji support. Broken rendering on older systems is a visual issue, not a measurement issue.

---

## 6. Search / Filter Architecture

### Findings

Decisions from context:
- **D-10**: Top-fixed search bar with type filter tags and date range picker, always visible during scroll.
- **D-11**: Real-time search with 300ms debounce. AbortController for cancelling stale requests.
- **D-12**: Search match highlighting — Claude's discretion. Must be applied **after** Pretext measurement (highlighted text is the same length as original).
- **D-09**: Filter/search changes reset scroll position to top.

Architecture options:
1. **Server-side search** (query FastAPI): Better for large datasets, supports full-text search indexes, pagination-compatible.
2. **Client-side search**: Faster feedback, works with mock data, but doesn't scale to thousands of entries.

Given the mock-first approach (D-05) and the requirement for cursor-based pagination (NAV-03), **server-side search is the target architecture**, with client-side filtering as a fallback for mock data.

### Implications for Planning

1. **Search bar component**: `SearchBar` with debounced input (300ms), type filter toggle buttons (Episode/Profile/Knowledge), date range picker (shadcn/ui DateRangePicker).
2. **AbortController pattern**: Each search request stores its AbortController. When a new request starts, abort the previous one.
3. **React Query integration**: `@tanstack/react-query` is the right tool here — it handles caching, deduplication, and AbortController natively via `signal` in query functions. It is **not yet installed** in package.json.
4. **Highlighting**: Mark matching text segments with `<mark>` tags after Pretext measurement. Since Pretext measures the raw text and the DOM renders the same text (just with `<mark>` wrappers), heights remain correct. The `<mark>` element must not change font or line-height.
5. **State management**: Search query, filters, and date range stored in URL search params (`useSearchParams`) for shareable URLs.

### Risks / Unknowns

- **Search highlighting with Pretext**: If highlighting wraps `<mark>` around measured text, the DOM structure changes (more elements) but text content stays the same. Verify this doesn't affect line-breaking behavior.
- **Date range picker dependency**: shadcn/ui's DateRangePicker may require `date-fns` or `dayjs`. Check which is appropriate.

---

## 7. Cursor-Based Pagination

### Findings

Cursor-based pagination with infinite scroll + virtual list requires:

1. **Pagination state**: `cursor: string | null` (null = first page), `hasMore: boolean`.
2. **Trigger**: When the user scrolls near the bottom of the virtual list, fetch the next page.
3. **Data accumulation**: Pages append to a growing array of items. The virtual list renders all accumulated items.

`@tanstack/react-query` v5 provides `useInfiniteQuery` which handles this pattern:

```ts
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ['memories', filters],
  queryFn: ({ pageParam }) => fetchMemories({ cursor: pageParam, ...filters }),
  getNextPageParam: (lastPage) => lastPage.cursor,
  initialPageParam: null,
})
```

Integration with react-virtual: Use the virtualizer's `getVirtualItems()` to detect when the last virtual item is near the bottom, then trigger `fetchNextPage()`.

### Implications for Planning

1. **Install `@tanstack/react-query` v5** alongside `@tanstack/react-virtual` v3.
2. **QueryClientProvider**: Add to root layout (or a `Providers` client component wrapper).
3. **Infinite query + virtualizer glue**: A custom hook or effect that watches `virtualizer.getVirtualItems()` and calls `fetchNextPage()` when the last visible item index approaches the total count.
4. **Filter/search reset** (D-09): When filters change, `queryKey` changes, React Query automatically resets and refetches from cursor=null.
5. **Page size**: 50 items per page is a reasonable default — enough to fill the viewport + overscan without excessive API calls.

### Risks / Unknowns

- **Prepare() cost on page load**: Each new page brings ~50 new texts to prepare. If `prepare()` takes ~1ms per text, that's ~50ms per page — acceptable but noticeable. Could batch-prepare in a `requestIdleCallback`.
- **Memory accumulation**: With infinite scroll, the items array grows unboundedly. For very long sessions (10,000+ items), memory could become an issue. Mitigation: the virtualizer only renders visible items (~20-30 DOM nodes), and the Pretext cache can be bounded.

---

## 8. Next.js 16 Routing

### Findings

Current route structure:
```
hub/src/app/
├── layout.tsx     (root layout — Inter font, metadata)
├── page.tsx       (home page — default create-next-app content)
├── globals.css    (Tailwind + Pretext block styles)
└── sandbox/       (Phase 1 sandbox demo)
```

Decision D-13 specifies:
- `/memories` — list page (main view)
- `/memories/:id` — detail page
- Root `/` redirects to `/memories`

Next.js 16 App Router patterns:
- `app/memories/page.tsx` — Server Component for the list page
- `app/memories/[id]/page.tsx` — Server Component for the detail page
- `app/memories/layout.tsx` — Optional shared layout (search bar, nav)

**Critical Next.js 16 note from `hub/AGENTS.md`**: "This is NOT the Next.js you know. This version has breaking changes." Key changes:
- `proxy.ts` replaces `middleware.ts`
- All async request APIs (`cookies`, `headers`, `params`) require `await`
- `params` in dynamic routes must be awaited: `const { id } = await params`

**SSR boundary pattern** (from Phase 1):
- Page files are Server Components (no `'use client'`)
- Pretext-dependent components imported via `next/dynamic` with `ssr: false` or wrapped in a `'use client'` component
- Phase 1 used a `SandboxBlockLoader` client component wrapper because Next.js 16 forbids `ssr: false` in Server Components directly (per STATE.md decision)

Responsive layout (D-14, NAV-04):
- Mobile (320px): single-column cards, search bar collapses, nav collapses to hamburger/sheet
- Desktop: full layout with sidebar or top nav

### Implications for Planning

1. **Create route directories**: `app/memories/page.tsx`, `app/memories/[id]/page.tsx`, `app/memories/layout.tsx`.
2. **Root redirect**: `app/page.tsx` should redirect to `/memories` (use `redirect()` from `next/navigation` or a rewrite in next.config.ts).
3. **Memories layout**: Contains the search bar, type filters, and nav. This can be a Server Component that renders client component children.
4. **Dynamic import pattern**: The `VirtualizedMemoryList` client component (which uses Pretext hooks) should be loaded via a client component wrapper, following the Phase 1 `SandboxBlockLoader` pattern.
5. **Detail page**: `await params` for the `[id]` segment. Fetch individual memory data. This page also needs Pretext measurement for the full content view.
6. **`next-themes` for dark mode**: Not yet installed. Required by D-04 and the stack spec. Install alongside shadcn/ui setup.

### Risks / Unknowns

- **Next.js 16 dynamic import behavior**: Phase 1 discovered that `ssr: false` doesn't work in Server Components. The workaround (client component wrapper) is established and should be reused.
- **Responsive nav**: shadcn/ui provides Sheet and Drawer components for mobile nav. These need to be installed via `npx shadcn@latest add`.

---

## Architecture Recommendations

### Component Tree

```
app/layout.tsx (Server — Inter font, ThemeProvider wrapper)
└── app/memories/layout.tsx (Server — nav bar, search bar shell)
    ├── app/memories/page.tsx (Server — passes initial data to client)
    │   └── MemoryListLoader.tsx ('use client' — dynamic wrapper)
    │       └── VirtualizedMemoryList.tsx ('use client' — virtual list)
    │           ├── EpisodeCard.tsx ('use client' — bubble layout)
    │           ├── ProfileCard.tsx ('use client' — structured + prose)
    │           └── KnowledgeBlock.tsx ('use client' — text block)
    └── app/memories/[id]/page.tsx (Server — detail view)
        └── MemoryDetailLoader.tsx ('use client' — dynamic wrapper)
            └── MemoryDetail.tsx ('use client' — full content view)
```

### Data Flow

```
EverMemOS API (or mock fixtures)
  → shared/api/client.ts (typed fetch + Zod validation)
    → @tanstack/react-query useInfiniteQuery
      → VirtualizedMemoryList (accumulates pages)
        → per-card usePrepared() + useLayout() → exact height
          → @tanstack/react-virtual estimateSize(index) → height
            → DOM renders only visible cards (~20-30)
```

### Shrinkwrap Bubble Flow (EpisodeCard)

```
Episode.turns[].content
  → usePreparedWithSegments(content, font)
    → findTightWrapMetrics(prepared, maxBubbleWidth) [ported from demo]
      → walkLineRanges() for maxLineWidth
      → binary search with layout() for tightest width
    → bubble DOM width = Math.ceil(tightMetrics.maxLineWidth) + padding
```

### Directory Structure (New Files)

```
shared/
├── types/
│   ├── episode.ts       (Zod schema + inferred type)
│   ├── profile.ts       (Zod schema + inferred type)
│   ├── knowledge.ts     (Zod schema + inferred type)
│   └── pagination.ts    (cursor envelope type)
└── api/
    └── client.ts        (typed fetch wrappers, useMock toggle)

hub/src/lib/mock/
├── episodes.json        (multilingual fixture data)
├── profiles.json
└── knowledge.json

hub/src/lib/pretext/
├── ...existing hooks...
├── shrinkwrap.ts        (findTightWrapMetrics, collectWrapMetrics)
└── (optional) usePreparedBatch.ts

hub/src/components/memory/
├── MemoryCard.tsx        (shared card shell)
├── EpisodeCard.tsx       (bubble conversation layout)
├── ProfileCard.tsx       (structured fields + prose)
├── KnowledgeBlock.tsx    (text content block)
├── VirtualizedMemoryList.tsx
├── MemoryListLoader.tsx  ('use client' wrapper)
├── SearchBar.tsx
├── TypeFilter.tsx
└── DateRangePicker.tsx

hub/src/app/memories/
├── layout.tsx           (nav + search bar)
├── page.tsx             (list view)
└── [id]/
    └── page.tsx         (detail view)
```

---

## Dependency Map

### New npm Dependencies (to install in hub/)

| Package | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-virtual` | `^3.x` | Virtualized list with dynamic heights |
| `@tanstack/react-query` | `^5.x` | Infinite query, caching, AbortController |
| `zod` | `^3.x` | API response validation |
| `next-themes` | `^0.4.x` | Dark mode toggle |

Additionally, shadcn/ui components need to be added via CLI:
- `npx shadcn@latest init` (if not already done)
- `npx shadcn@latest add badge button input card sheet`
- Date range picker component (may require custom implementation or a calendar component)

### Execution Order Dependencies

```
1. shared/ types + Zod schemas (no deps)
2. shared/ API client + mock data (depends on 1)
3. shadcn/ui + next-themes setup (no deps — can parallel with 1-2)
4. Pretext shrinkwrap utilities (depends on existing hooks)
5. Memory card components (depends on 2, 3, 4)
6. VirtualizedMemoryList + react-virtual (depends on 5)
7. Search/filter components (depends on 3)
8. Route structure + page components (depends on 6, 7)
9. Cursor-based pagination wiring (depends on 6, 8)
10. Multilingual testing + visual QA (depends on all above)
```

Steps 1-4 are independent and can be parallelized. Steps 5-8 have sequential dependencies. Step 9-10 are integration work.

### Critical Path

**shared/ schemas → API client + mock → card components → virtualized list → routing → pagination**

The card components (especially EpisodeCard with bubble layout) are the highest-effort items and should be started early.

---

## RESEARCH COMPLETE
