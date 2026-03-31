# Phase 2: Memory Rendering - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Fetch real EverMemOS memory data from the FastAPI backend and render episodes, profiles, and knowledge entries in virtualized, Pretext-laid-out cards with full multilingual support. Includes search, filtering, cursor-based pagination, and responsive layout. After this phase: a user can browse, search, and filter thousands of memory entries with smooth scrolling and correct CJK/Arabic/emoji rendering.

</domain>

<decisions>
## Implementation Decisions

### Card Visual Style
- **D-01:** Unified card shell for all three memory types (Episode/Profile/Knowledge). Same rounded corners, border, dark background. Type badge in upper-left corner with weak color differentiation (Episode=blue, Profile=emerald, Knowledge=amber).
- **D-02:** Dual-mode density toggle — compact (3-4 line preview + metadata) and expanded (full content). User can switch globally. Pretext measures truncated height in compact mode, full height in expanded mode.
- **D-03:** Episode cards use bubble-style conversation layout — User messages left-aligned, Agent messages right-aligned, wrapped in bubbles. Pretext `walkLineRanges()` used for shrinkwrap bubble width.

### Color Scheme
- **D-04:** Claude's Discretion — choose appropriate OKLCH color scheme for dark mode. Keep consistent with shadcn/ui default theme. Zinc-based neutral tones preferred.

### API Data Integration
- **D-05:** Local JSON mock data during development. Place fixtures in `hub/src/lib/mock/` with a `useMock` flag in the API client. Include multilingual test data (English, CJK, Arabic, emoji).
- **D-06:** Zod schemas and API client live in `shared/` directory — `shared/types/` for Zod schemas + inferred types, `shared/api/` for typed fetch wrappers. Reusable across future frontends.
- **D-07:** API structure follows EverMemOS documentation. Reference the official API docs for endpoint paths, request/response shapes, and pagination format.

### Virtualization & Scrolling
- **D-08:** Infinite scroll with cursor-based pagination. @tanstack/react-virtual v3 for dynamic heights. Pretext `layout()` provides exact row heights — no guesstimates.
- **D-09:** Filter/search changes reset scroll position to top. New query = new result set = top of list.

### Search & Filtering
- **D-10:** Top-fixed search bar with type filter tags and date range picker above the memory list. Always visible during scroll.
- **D-11:** Real-time search with 300ms debounce. Results update as user types. AbortController for cancelling stale requests.
- **D-12:** Claude's Discretion — search match highlighting implementation. Note: Pretext measures pure text; highlighting must be applied after Pretext measurement in the rendering layer.

### Navigation & Routing
- **D-13:** Two-level routing: `/memories` (list page, main view) and `/memories/:id` (detail page). Root `/` redirects to `/memories`.
- **D-14:** Responsive layout per NAV-04: mobile (320px) single-column cards, search bar collapses, nav collapses to hamburger/sheet.

### Loading & Empty States
- **D-15:** Claude's Discretion — choose between skeleton cards vs spinner for loading, and illustration+copy vs plain text for empty states. Follow shadcn/ui patterns.

### Claude's Discretion
- Dark mode OKLCH color palette (D-04)
- Search highlighting implementation (D-12)
- Loading/empty state visual treatment (D-15)
- CJK font lazy loading strategy (deferred from Phase 1 D-05)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### EverMemOS API
- `https://github.com/EverMind-AI/EverMemOS` — Source repo, check for API route definitions
- `https://docs.evermind.ai/api-reference/introduction` — Official API documentation for endpoint paths, request/response shapes, pagination

### Pretext API
- `pretext/src/layout.ts` — Core API: prepare(), layout(), prepareWithSegments(), layoutWithLines(), walkLineRanges(), layoutNextLine()
- `pretext/CLAUDE.md` — Constraints, gotchas, usage patterns

### Phase 1 Artifacts
- `.planning/phases/01-foundation/01-CONTEXT.md` — Submodule consumption, font config, hook API design decisions
- `.planning/phases/01-foundation/01-01-SUMMARY.md` — Hub scaffold details
- `.planning/phases/01-foundation/01-02-SUMMARY.md` — Hook implementation details

### Existing Code
- `hub/src/lib/pretext/index.ts` — Barrel export of all hooks (usePrepared, useLayout, useContainerWidth, usePreparedWithSegments, PRETEXT_FONT, PRETEXT_LINE_HEIGHT)
- `hub/src/lib/pretext/fonts.ts` — PRETEXT_FONT constant and line height
- `hub/src/components/sandbox/SandboxBlock.tsx` — Reference pattern for Pretext client component integration

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `hub/src/lib/pretext/usePrepared.ts` — Module-level cache, fonts.ready guard. Use for all card content measurement.
- `hub/src/lib/pretext/useLayout.ts` — Pure arithmetic layout. Use for dynamic height calculation in virtual list.
- `hub/src/lib/pretext/useContainerWidth.ts` — ResizeObserver + RAF. Use for responsive card width tracking.
- `hub/src/lib/pretext/usePreparedWithSegments.ts` — Rich path for bidi/CJK. Use for Arabic and mixed-direction content.
- `hub/src/components/sandbox/SandboxBlock.tsx` — Reference implementation of the prepare→width→layout chain.

### Established Patterns
- SSR boundary: Server Component page + `dynamic(ssr: false)` Client Component wrapper
- Pretext hooks are `'use client'` only — never import on server
- Module-level `Map` cache for `prepare()` results — extend for card content
- PRETEXT_FONT = '16px Inter' — single source of truth

### Integration Points
- `hub/src/app/` — Add `/memories` and `/memories/[id]` route directories
- `hub/src/components/` — Add `memory/` directory for card components
- `hub/src/lib/` — Add `api/` or use `shared/` for API client
- `hub/src/app/layout.tsx` — May need nav component in root layout

</code_context>

<specifics>
## Specific Ideas

- Episode conversations rendered as chat bubbles with shrinkwrap widths via `walkLineRanges()`
- Compact/expanded toggle affects Pretext measurement — compact truncates at N lines, expanded measures full content
- Mock data must include multilingual content for each memory type to validate CJK/Arabic/emoji rendering

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-memory-rendering*
*Context gathered: 2026-03-31*
