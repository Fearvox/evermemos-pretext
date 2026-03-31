# Requirements: EverMemOS-Pretext

**Defined:** 2026-03-31
**Core Value:** Memory content in EverMemOS Hub renders beautifully with proper text layout — all languages, virtualized, advanced layouts

## v1 Requirements

### Scaffold & Infrastructure (INFRA)

- [ ] **INFRA-01**: Next.js 16 App Router hub on port 3001 with Tailwind v4 + shadcn/ui + dark mode
- [ ] **INFRA-02**: Pretext git submodule consumed via path alias + transpilePackages in next.config.ts
- [ ] **INFRA-03**: Dual package manager isolation (npm for hub, bun for pretext) with setup script
- [ ] **INFRA-04**: TypeScript compilation boundary — hub tsconfig excludes pretext/src, references dist/layout.d.ts
- [ ] **INFRA-05**: Vercel build command includes submodule init + bun build:package before next build

### Pretext Integration (PTXT)

- [ ] **PTXT-01**: usePrepared hook — module-level Map cache, awaits document.fonts.ready, returns PreparedText
- [ ] **PTXT-02**: useLayout hook — calls layout() with current width and lineHeight, returns height/lineCount
- [ ] **PTXT-03**: useContainerWidth hook — ResizeObserver-backed, debounced, returns pixel width
- [ ] **PTXT-04**: usePreparedWithSegments hook — rich path for bidi/CJK rendering with layoutWithLines()
- [ ] **PTXT-05**: Sandbox test page — single measured text block proving SSR-safe client hydration works
- [ ] **PTXT-06**: PRETEXT_FONT constant — Inter via next/font, used in both CSS and prepare() calls, never system-ui

### Memory Rendering (MEM)

- [ ] **MEM-01**: EpisodeCard — displays conversation episodes with turn-by-turn layout via Pretext
- [ ] **MEM-02**: ProfileCard — displays user/agent profiles with structured + prose sections
- [ ] **MEM-03**: KnowledgeBlock — displays knowledge graph entries with Pretext text layout
- [ ] **MEM-04**: VirtualizedMemoryList — @tanstack/react-virtual v3, dynamic heights from Pretext layout()
- [ ] **MEM-05**: Multilingual text — CJK, Arabic, emoji, mixed-bidi all render correctly
- [ ] **MEM-06**: EverMemOS API client — typed fetch wrappers with Zod validation in shared/

### Search & Navigation (NAV)

- [ ] **NAV-01**: Full-text search with matched-term highlighting across memory content
- [ ] **NAV-02**: Filter by memory type (episode, profile, knowledge), date range, tags
- [ ] **NAV-03**: Cursor-based pagination for memory lists of thousands of entries
- [ ] **NAV-04**: Responsive layout — mobile (320px) through desktop, nav collapses, cards single-column

### UI Polish (UI)

- [ ] **UI-01**: Loading states — skeleton loaders via Suspense boundaries for memory cards
- [ ] **UI-02**: Error states — error.tsx boundaries with retry, empty-state messaging
- [ ] **UI-03**: Dark mode — next-themes with blocking inline script, OKLCH tokens
- [ ] **UI-04**: Shrinkwrap text containers — speech bubbles/labels pixel-tight via walkLineRanges()

### Interactive Demos (DEMO)

- [ ] **DEMO-01**: BubblesDemo — port Pretext bubbles demo to Next.js client component
- [ ] **DEMO-02**: MasonryDemo — masonry card layout with columns computed from Pretext heights
- [ ] **DEMO-03**: DynamicLayoutDemo — editorial spread with obstacle-aware text flow
- [ ] **DEMO-04**: Demo landing page — index of all interactive Pretext demos within Hub

## v2 Requirements

### Advanced Features

- **ADV-01**: Obstacle-aware text flow in memory cards (text routes around images/widgets)
- **ADV-02**: Animated layout transitions when memory content changes
- **ADV-03**: Memory timeline visualization with time-based clustering
- **ADV-04**: Export memory views as PDF with Pretext-driven layout

### Performance

- **PERF-01**: Web Worker offloading for prepare() on large text batches
- **PERF-02**: Service Worker caching for offline memory browsing

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full text editor | Pretext is read-only layout engine, not an editor |
| Real-time collaboration | No product requirement; memory is agent-written |
| Custom font rendering engine | Pretext uses browser canvas as ground truth |
| Rich media attachments (video/audio) | EverMemOS memory is text-only |
| Canvas SSR polyfill (node-canvas) | Produces wrong measurements, native binary complications |
| EverMemOS backend changes | Consume existing API only |
| Authentication/authorization | Defer to EverMemOS's existing auth system |
| Mobile native app | Web-first |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| INFRA-04 | Phase 1 | Pending |
| INFRA-05 | Phase 1 | Pending |
| PTXT-01 | Phase 1 | Pending |
| PTXT-02 | Phase 1 | Pending |
| PTXT-03 | Phase 1 | Pending |
| PTXT-04 | Phase 1 | Pending |
| PTXT-05 | Phase 1 | Pending |
| PTXT-06 | Phase 1 | Pending |
| MEM-01 | Phase 2 | Pending |
| MEM-02 | Phase 2 | Pending |
| MEM-03 | Phase 2 | Pending |
| MEM-04 | Phase 2 | Pending |
| MEM-05 | Phase 2 | Pending |
| MEM-06 | Phase 2 | Pending |
| NAV-01 | Phase 2 | Pending |
| NAV-02 | Phase 2 | Pending |
| NAV-03 | Phase 2 | Pending |
| NAV-04 | Phase 2 | Pending |
| UI-01 | Phase 3 | Pending |
| UI-02 | Phase 3 | Pending |
| UI-03 | Phase 3 | Pending |
| UI-04 | Phase 3 | Pending |
| DEMO-01 | Phase 3 | Pending |
| DEMO-02 | Phase 3 | Pending |
| DEMO-03 | Phase 3 | Pending |
| DEMO-04 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-31*
*Last updated: 2026-03-31 after initial definition*
