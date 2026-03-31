# Roadmap: EverMemOS-Pretext

**Created:** 2026-03-31
**Granularity:** Coarse (3 phases)
**Total requirements:** 29

## Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Foundation | Scaffold Next.js Hub and wire Pretext integration hooks | INFRA-01–05, PTXT-01–06 | 5 criteria |
| 2 | Memory Rendering | Display real EverMemOS memory data with virtualization and multilingual support | MEM-01–06, NAV-01–04 | 4 criteria |
| 3 | Polish & Demos | Ship interactive Pretext showcases and full UI polish | UI-01–04, DEMO-01–04 | 4 criteria |

## Phase Details

### Phase 1: Foundation ✅ COMPLETE
**Goal:** Scaffold the Next.js 16 Hub, establish Pretext as a git submodule with working integration hooks, and prove SSR-safe client hydration on a sandbox page.
**Requirements:** INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, PTXT-01, PTXT-02, PTXT-03, PTXT-04, PTXT-05, PTXT-06
**UI hint:** yes — sandbox page renders measured text block; dark mode skeleton in place
**Plans:** 01-01 ✅ | 01-02 ✅ | 01-03 ✅

**Success Criteria:**
1. `npm run dev` starts Hub on port 3001 without errors; Pretext submodule is initialized and `dist/layout.js` is present.
2. The sandbox page (`/sandbox`) renders a single text block whose container height is computed by Pretext `layout()` — confirmed via browser DevTools (no height: auto, exact pixel value).
3. Page load produces no SSR errors: server renders a skeleton shell; Pretext measurement fires only after hydration (confirmed by disabling JS: skeleton visible, no white flash).
4. `PRETEXT_FONT` constant (`'16px Inter'`) is used consistently in both the CSS class and all `prepare()` calls — zero occurrences of `system-ui` in Pretext-related code.
5. `vercel build` completes successfully end-to-end (submodule init + bun build:package + next build) in a clean CI environment.

### Phase 2: Memory Rendering
**Goal:** Fetch real EverMemOS memory data from the FastAPI backend and render episodes, profiles, and knowledge entries in virtualized, Pretext-laid-out cards with full multilingual support.
**Requirements:** MEM-01, MEM-02, MEM-03, MEM-04, MEM-05, MEM-06, NAV-01, NAV-02, NAV-03, NAV-04
**UI hint:** yes — EpisodeCard, ProfileCard, KnowledgeBlock, VirtualizedMemoryList, search + filter bar, responsive nav

**Success Criteria:**
1. Hub Hub page displays live data fetched from the EverMemOS FastAPI backend — episodes, profiles, and knowledge entries each rendered in their respective card component with Pretext-measured heights.
2. A virtualized list of 1,000+ entries scrolls without visible scroll-jumps: Pretext `layout()` heights eliminate guesstimates in `@tanstack/react-virtual` row measurement.
3. CJK (Chinese/Japanese/Korean), Arabic (RTL), and emoji content all render without overflow, clipping, or bidi inversion — confirmed on at least one real memory entry of each type.
4. Full-text search, type/date/tag filters, and cursor-based pagination all function: a user can locate a specific memory entry among thousands without page reload.

### Phase 3: Polish & Demos
**Goal:** Deliver interactive Pretext demo pages (bubbles, masonry, dynamic layout) and complete UI polish — dark mode, skeleton loaders, error states, and shrinkwrap containers.
**Requirements:** UI-01, UI-02, UI-03, UI-04, DEMO-01, DEMO-02, DEMO-03, DEMO-04
**UI hint:** yes — demo landing page, three interactive demo components, skeleton loaders, error boundaries, dark/light toggle

**Success Criteria:**
1. The demo landing page (`/demos`) lists all three interactive demos; each demo loads as a client component with `ssr: false` and renders without SSR errors.
2. Dark mode toggles correctly on all pages with no white flash on initial load — confirmed by hard-refreshing in both `prefers-color-scheme: dark` and light system settings.
3. Skeleton loaders appear during data fetch (Suspense boundaries active); error boundaries display retry UI on simulated API failure; empty states show informative messaging when no memories match a filter.
4. Shrinkwrap containers (speech bubbles, labels) are pixel-tight around multi-line content on the BubblesDemo — container width matches text width to within 1px via `walkLineRanges()`.

## Requirement Coverage

| Requirement | Phase | Category |
|-------------|-------|----------|
| INFRA-01 | Phase 1 | Scaffold & Infrastructure |
| INFRA-02 | Phase 1 | Scaffold & Infrastructure |
| INFRA-03 | Phase 1 | Scaffold & Infrastructure |
| INFRA-04 | Phase 1 | Scaffold & Infrastructure |
| INFRA-05 | Phase 1 | Scaffold & Infrastructure |
| PTXT-01 | Phase 1 | Pretext Integration |
| PTXT-02 | Phase 1 | Pretext Integration |
| PTXT-03 | Phase 1 | Pretext Integration |
| PTXT-04 | Phase 1 | Pretext Integration |
| PTXT-05 | Phase 1 | Pretext Integration |
| PTXT-06 | Phase 1 | Pretext Integration |
| MEM-01 | Phase 2 | Memory Rendering |
| MEM-02 | Phase 2 | Memory Rendering |
| MEM-03 | Phase 2 | Memory Rendering |
| MEM-04 | Phase 2 | Memory Rendering |
| MEM-05 | Phase 2 | Memory Rendering |
| MEM-06 | Phase 2 | Memory Rendering |
| NAV-01 | Phase 2 | Search & Navigation |
| NAV-02 | Phase 2 | Search & Navigation |
| NAV-03 | Phase 2 | Search & Navigation |
| NAV-04 | Phase 2 | Search & Navigation |
| UI-01 | Phase 3 | UI Polish |
| UI-02 | Phase 3 | UI Polish |
| UI-03 | Phase 3 | UI Polish |
| UI-04 | Phase 3 | UI Polish |
| DEMO-01 | Phase 3 | Interactive Demos |
| DEMO-02 | Phase 3 | Interactive Demos |
| DEMO-03 | Phase 3 | Interactive Demos |
| DEMO-04 | Phase 3 | Interactive Demos |

**Coverage: 29 / 29 requirements mapped. Unmapped: 0 ✓**

---
*Created: 2026-03-31*
