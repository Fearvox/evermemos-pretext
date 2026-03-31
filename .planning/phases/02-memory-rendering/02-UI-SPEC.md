---
phase: 2
slug: memory-rendering
status: draft
shadcn_initialized: false
preset: none
created: 2026-03-31
---

# Phase 2 — UI Design Contract

> Visual and interaction contract for Memory Rendering phase.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (must initialize via `npx shadcn@latest init` before Phase 2 work) |
| Preset | default (dark mode, Tailwind v4) |
| Component library | Radix UI (via shadcn/ui) |
| Icon library | Lucide React |
| Font | Inter (already configured via `next/font/google`, variable `--font-inter`) |

**Initialization command:**
```bash
cd hub && npx shadcn@latest init
```

---

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Inline icon gaps, badge internal padding |
| sm | 8px | Between label and value, between badge and card edge |
| md | 16px | Card internal padding, gap between list items |
| lg | 24px | Section spacing within a card, gap between card and search bar |
| xl | 32px | Page horizontal padding (desktop), gap between major sections |
| 2xl | 48px | Top padding below fixed search bar |
| 3xl | 64px | Not used in Phase 2 |

Exceptions: Bubble internal padding uses 12px (3 * xs) horizontally, 8px (sm) vertically — a single exception to the scale for visual comfort in chat bubbles.

---

## Typography

| Role | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| Body | 16px / 1rem | 400 (regular) | 24px / 1.5 | Card content text, conversation messages, knowledge body. Matches `PRETEXT_FONT = '16px Inter'` and `PRETEXT_LINE_HEIGHT = 24`. |
| Label | 12px / 0.75rem | 500 (medium) | 16px / 1.333 | Type badges, metadata (timestamps, turn counts), filter tags, search result count. |
| Heading | 18px / 1.125rem | 600 (semibold) | 24px / 1.333 | Card title (profile name, episode title, knowledge subject), section headers. |
| Display | 24px / 1.5rem | 600 (semibold) | 32px / 1.333 | Page title ("Memories"), empty state heading. |

Font weights used: 400 (regular), 500 (medium for labels only), 600 (semibold). Three weights total, with medium restricted to small-text labels.

---

## Color

All values in OKLCH. Dark mode is the primary and only mode for Phase 2 (light mode deferred to Phase 3 polish).

### Surface Palette (zinc-based dark)

| Role | OKLCH Value | Hex Approx | Usage |
|------|-------------|-----------|-------|
| Dominant (60%) | `oklch(0.145 0.005 285)` | #0a0a0f | Page background, scroll area behind cards |
| Secondary (30%) | `oklch(0.205 0.006 285)` | #18181b | Card backgrounds, search bar background |
| Tertiary | `oklch(0.265 0.007 285)` | #27272a | Hover states on cards, active filter tag background |
| Border | `oklch(0.325 0.007 285)` | #3f3f46 | Card borders, separator lines, input borders |
| Muted text | `oklch(0.555 0.010 285)` | #71717a | Timestamps, secondary metadata, placeholder text |
| Foreground | `oklch(0.935 0.005 285)` | #fafafa | Primary text, headings |
| Foreground secondary | `oklch(0.775 0.008 285)` | #a1a1aa | Body text in cards, conversation content |

### Accent Colors

| Role | OKLCH Value | Hex Approx | Usage |
|------|-------------|-----------|-------|
| Accent (10%) | `oklch(0.650 0.170 250)` | #3b82f6 | Focus rings, active search input border, selected nav item |
| Destructive | `oklch(0.580 0.200 25)` | #ef4444 | Error state text, error boundary icon |

### Type Badge Colors

| Type | Background OKLCH | Text OKLCH | Hex Approx (bg/text) | Usage |
|------|-----------------|-----------|---------------------|-------|
| Episode | `oklch(0.300 0.060 250)` | `oklch(0.750 0.120 250)` | #1e3a5f / #60a5fa | Episode card badge, episode filter tag |
| Profile | `oklch(0.280 0.060 165)` | `oklch(0.720 0.120 165)` | #14532d / #34d399 | Profile card badge, profile filter tag |
| Knowledge | `oklch(0.300 0.060 85)` | `oklch(0.720 0.120 85)` | #451a03 / #fbbf24 | Knowledge card badge, knowledge filter tag |

Accent reserved for: focus rings on interactive elements, active search input border, selected navigation indicator. Never used as card background or text color.

### Bubble Colors (Episode conversations)

| Role | OKLCH Value | Hex Approx | Usage |
|------|-------------|-----------|-------|
| User bubble bg | `oklch(0.350 0.050 250)` | #1e3a5f | User message bubbles (left-aligned) |
| Agent bubble bg | `oklch(0.250 0.008 285)` | #27272a | Agent message bubbles (right-aligned) |
| User bubble text | `oklch(0.900 0.010 250)` | #dbeafe | Text inside user bubbles |
| Agent bubble text | `oklch(0.850 0.008 285)` | #e4e4e7 | Text inside agent bubbles |

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Page title | Memories |
| Search placeholder | Search memories... |
| Empty state heading | No memories found |
| Empty state body | Try adjusting your search or filters to find what you're looking for. |
| Error state heading | Something went wrong |
| Error state body | We couldn't load your memories. Please try again. |
| Error retry CTA | Retry |
| Compact/expanded toggle label (compact) | Show more |
| Compact/expanded toggle label (expanded) | Show less |
| Loading state | 3 skeleton cards with shimmer animation (no text) |
| Episode badge label | Episode |
| Profile badge label | Profile |
| Knowledge badge label | Knowledge |
| Filter "all types" label | All |
| Pagination loading | Loading more... (shown as bottom-of-list indicator) |
| No more results | You've reached the end |
| Search result count | {n} memories (shown below search bar when query is active) |
| Date range picker placeholder | Filter by date |

---

## Component Inventory

| Component | shadcn Base | Phase-Specific Notes |
|-----------|-------------|---------------------|
| `MemoryCard` | `Card` | Unified shell: rounded-lg border, dark bg, type badge top-left. Handles compact/expanded toggle. Click navigates to `/memories/:id`. |
| `EpisodeCard` | None (custom) | Extends MemoryCard content area. Bubble chat layout — user left, agent right. Uses `usePreparedWithSegments` + shrinkwrap utilities. |
| `ProfileCard` | None (custom) | Extends MemoryCard content area. Structured fields (name, role) + prose description block via `usePrepared`. |
| `KnowledgeBlock` | None (custom) | Extends MemoryCard content area. Text content block with Pretext measurement. |
| `VirtualizedMemoryList` | None (custom, uses `@tanstack/react-virtual`) | Scroll container, dynamic heights from Pretext `layout()`. Overscan 5 items. Triggers `fetchNextPage` at bottom. |
| `MemoryListLoader` | None (custom `'use client'` wrapper) | `dynamic({ ssr: false })` pattern from Phase 1. Wraps VirtualizedMemoryList. |
| `SearchBar` | `Input` | Top-fixed, 300ms debounced, `AbortController` for stale requests. Stores query in URL search params. |
| `TypeFilter` | `Badge` (toggle variant) | Three toggle badges: Episode, Profile, Knowledge. Multi-select. Colored per type badge palette. |
| `DateRangePicker` | `Button` + `Popover` + `Calendar` | Date range selection for filtering. Uses shadcn Calendar component internally. |
| `DensityToggle` | `Button` (icon variant) | Compact/expanded toggle. Single icon button in search bar area. |
| `TypeBadge` | `Badge` | Small colored badge — renders type label with type-specific bg/text colors from palette above. |
| `MemoryCardSkeleton` | `Skeleton` | Loading placeholder card. Matches card dimensions, shimmer animation. 3 shown during initial load. |
| `EmptyState` | None (custom) | Centered illustration area + heading + body copy. Uses Lucide `SearchX` icon. |
| `ErrorBoundary` | None (custom `error.tsx`) | Error heading + body + retry button. Uses Lucide `AlertCircle` icon. |
| `MemoryDetail` | `Card` | Full content view on `/memories/:id`. Full-height Pretext rendering, no truncation. |
| `MemoryDetailLoader` | None (custom `'use client'` wrapper) | SSR-safe wrapper for MemoryDetail. |
| `PaginationIndicator` | None (custom) | Bottom-of-list loading spinner + "Loading more..." text, or "You've reached the end" when `hasMore === false`. |
| `SearchHighlight` | None (custom `<mark>` wrapper) | Wraps matched text segments in `<mark>` with `oklch(0.300 0.060 85)` background (amber tint). Must not alter font-family, font-size, or line-height. Preserves Pretext measurement accuracy. |
| `MemoriesNav` | `Sheet` (mobile) | Responsive navigation. Desktop: minimal top bar with page title. Mobile (<=640px): hamburger icon opens Sheet with nav links. |

### shadcn Components to Install

```bash
npx shadcn@latest add badge button card input popover calendar skeleton sheet
```

### Additional npm Dependencies

```bash
cd hub && npm install @tanstack/react-virtual @tanstack/react-query zod next-themes lucide-react date-fns
```

---

## Layout Specifications

### Search Bar (fixed)

| Property | Value |
|----------|-------|
| Position | `sticky top-0 z-10` |
| Height | 56px (includes 16px vertical padding) |
| Background | Dominant surface with `backdrop-blur-sm` for scroll-under effect |
| Border bottom | 1px Border color |
| Content | Input (flex-1) + TypeFilter badges + DateRangePicker + DensityToggle |
| Mobile (<640px) | Input full-width on first row, filters wrap to second row |

### Card (compact mode)

| Property | Value |
|----------|-------|
| Width | 100% of container (single column, all breakpoints in Phase 2) |
| Max width | 720px (centered) |
| Padding | 16px (md) |
| Border radius | 8px (rounded-lg) |
| Border | 1px Border color |
| Background | Secondary surface |
| Content height | Pretext-measured for 3-4 lines of truncated text + 32px metadata row |
| Gap between cards | 16px (md) |

### Card (expanded mode)

Same as compact except: Content height is Pretext-measured for full text. No truncation.

### Bubble (episode messages)

| Property | Value |
|----------|-------|
| Max width | 80% of card content area (`BUBBLE_MAX_RATIO = 0.8`) |
| Padding | 12px horizontal, 8px vertical |
| Border radius | 12px (rounded-xl), with 4px on the tail corner |
| Gap between bubbles | 8px (sm) |
| User alignment | Left (`justify-start`) |
| Agent alignment | Right (`justify-end`) |

### Page Layout

| Property | Value |
|----------|-------|
| Max content width | 720px (centered with `mx-auto`) |
| Page horizontal padding | 16px (mobile), 32px (desktop >=1024px) |
| Top padding (below fixed search bar) | 48px (2xl) includes search bar height + gap |

---

## Interaction Specifications

### Search

| Behavior | Detail |
|----------|--------|
| Debounce | 300ms after last keystroke |
| Abort | New query aborts previous in-flight request via `AbortController` |
| Reset | New search resets scroll position to top (D-09) |
| Highlight | Matched terms wrapped in `<mark>` with amber-tinted background |
| URL sync | Query string stored in `?q=` search param |

### Compact/Expanded Toggle

| Behavior | Detail |
|----------|--------|
| Scope | Global toggle affects all cards simultaneously |
| Animation | `transition-[height] duration-200 ease-out` on card content area |
| Height recalc | Toggle triggers Pretext `layout()` recalculation for all visible items, virtualizer `measure()` refresh |

### Infinite Scroll

| Behavior | Detail |
|----------|--------|
| Trigger | Last visible virtual item index within 5 items of total count |
| Page size | 50 items per request |
| Indicator | `PaginationIndicator` appended after last card |

### Card Click

| Behavior | Detail |
|----------|--------|
| Action | Navigate to `/memories/:id` via `next/navigation` `useRouter().push()` |
| Hover | Card background transitions to Tertiary surface color, `transition-colors duration-150` |
| Focus | 2px Accent focus ring, `outline-offset-2` |

---

## Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | 320px - 639px | Single column, search input full-width, filters wrap to second row, nav collapses to hamburger Sheet |
| Tablet | 640px - 1023px | Single column, search bar single row, nav visible |
| Desktop | 1024px+ | Single column (720px max, centered), full search bar, full nav |

Phase 2 uses single-column layout at all breakpoints. Multi-column (masonry) is deferred to Phase 3 demos.

---

## Loading & Empty States (D-15 Decision)

### Loading

**Skeleton cards** (not spinner). Three `MemoryCardSkeleton` components stacked vertically, each matching card dimensions with:
- Shimmer animation (`@keyframes shimmer` already in `globals.css`)
- Type badge skeleton: 48px wide rounded pill
- Title skeleton: 60% width bar
- Content skeleton: 3 lines at 100%, 100%, 70% width
- Metadata skeleton: 2 small bars at bottom

### Empty State

**Illustration + copy** (not plain text):
- Lucide `SearchX` icon at 48px, Muted text color
- "No memories found" heading (Display size)
- Supportive body copy (Body size, Muted text color)
- Centered vertically in the scroll area

---

## Search Highlighting (D-12 Decision)

Implementation: **Post-measurement `<mark>` wrapping**.

1. Pretext measures the raw text string (no markup).
2. After measurement, the rendering layer splits the text at match boundaries.
3. Matched segments are wrapped in `<mark>` elements.
4. `<mark>` is styled: `background: oklch(0.300 0.060 85 / 0.3)` (semi-transparent amber), `color: inherit`, `font: inherit`, `line-height: inherit`, `padding: 0`, `border-radius: 2px`.
5. This preserves Pretext measurement accuracy because the `<mark>` element does not alter text metrics.

---

## CSS Variable Contract

These variables must be added to `globals.css` inside the `@theme inline` block or as `:root` custom properties when shadcn/ui is initialized:

```css
:root {
  --surface-dominant: oklch(0.145 0.005 285);
  --surface-secondary: oklch(0.205 0.006 285);
  --surface-tertiary: oklch(0.265 0.007 285);
  --border: oklch(0.325 0.007 285);
  --text-muted: oklch(0.555 0.010 285);
  --text-primary: oklch(0.935 0.005 285);
  --text-secondary: oklch(0.775 0.008 285);
  --accent: oklch(0.650 0.170 250);
  --destructive: oklch(0.580 0.200 25);

  --badge-episode-bg: oklch(0.300 0.060 250);
  --badge-episode-text: oklch(0.750 0.120 250);
  --badge-profile-bg: oklch(0.280 0.060 165);
  --badge-profile-text: oklch(0.720 0.120 165);
  --badge-knowledge-bg: oklch(0.300 0.060 85);
  --badge-knowledge-text: oklch(0.720 0.120 85);

  --bubble-user-bg: oklch(0.350 0.050 250);
  --bubble-agent-bg: oklch(0.250 0.008 285);
  --bubble-user-text: oklch(0.900 0.010 250);
  --bubble-agent-text: oklch(0.850 0.008 285);

  --highlight-bg: oklch(0.300 0.060 85 / 0.3);
}
```

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn/ui (default) | badge, button, card, input, popover, calendar, skeleton, sheet | All from official shadcn registry. No third-party registries. Verify each component installs cleanly with `npx shadcn@latest add <name>` before use. |
| @tanstack/react-virtual | useVirtualizer | Stable v3 API. No registry — direct npm install. |
| @tanstack/react-query | useInfiniteQuery, QueryClientProvider | Stable v5 API. No registry — direct npm install. |

No third-party shadcn registries, no blocks from community registries, no copy-pasted component code from external sources.

---

## Requirement Traceability

| UI Element | Requirement | Decision |
|------------|-------------|----------|
| MemoryCard (unified shell) | MEM-01, MEM-02, MEM-03 | D-01 |
| DensityToggle (compact/expanded) | MEM-01, MEM-02, MEM-03 | D-02 |
| EpisodeCard (bubble layout) | MEM-01 | D-03 |
| OKLCH dark palette | — | D-04 |
| VirtualizedMemoryList | MEM-04 | D-08 |
| Multilingual rendering | MEM-05 | — |
| SearchBar | NAV-01 | D-10, D-11 |
| SearchHighlight | NAV-01 | D-12 |
| TypeFilter + DateRangePicker | NAV-02 | D-10 |
| PaginationIndicator | NAV-03 | D-08, D-09 |
| Responsive layout | NAV-04 | D-14 |
| MemoryCardSkeleton / EmptyState | — | D-15 |
| Route structure | — | D-13 |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
