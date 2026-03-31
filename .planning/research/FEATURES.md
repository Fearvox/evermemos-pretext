# Features Research

## Table Stakes

Features users expect from any memory visualization system. Absence causes immediate abandonment.

### Memory Content Display

**What**: Render conversations (turn-by-turn), episodes (timestamped events), and user profiles (structured key-value + prose) as readable cards or list items.

**Complexity**: Medium. Requires data normalization layer between EverMemOS FastAPI response shapes and React component props. Three distinct content types each need their own rendering component.

**Dependencies**: EverMemOS API endpoint contracts, shadcn/ui Card + ScrollArea primitives, Pretext for body text layout within each card.

---

### Search and Filtering

**What**: Full-text search across memory content, filter by type (conversation / episode / profile), date range, and tags/entities. Results highlight matched terms.

**Complexity**: Medium. Search can be server-side (query FastAPI) or client-side (filter in-memory on fetched data). Client-side is simpler for an MVP. Highlight rendering requires splitting matched substrings — straightforward without Pretext involvement.

**Dependencies**: EverMemOS API search endpoint (or in-memory filtering), debounce hook, shadcn/ui Input + Select + DatePicker.

---

### Responsive Layout

**What**: Usable on mobile (≥320px), tablet, and desktop. Navigation collapses on small screens. Memory cards reflow to single-column on narrow viewports.

**Complexity**: Low–Medium. Tailwind breakpoints handle most of this. The only non-trivial part is ensuring Pretext measurement re-runs when viewport width changes (resize observer on the layout container).

**Dependencies**: Tailwind responsive utilities, ResizeObserver, Pretext `layout()` called on resize events.

---

### Basic Text Rendering Quality

**What**: Memory text renders without overflow, clipping, or invisible characters. CJK and emoji display correctly at minimum — no mojibake. Line breaks follow word boundaries.

**Complexity**: Low without Pretext (browser handles it); Medium with Pretext (requires correct font registration and `prepare()` calls). The browser fallback is acceptable for MVP; Pretext upgrades quality in later phases.

**Dependencies**: CSS `overflow-wrap: break-word` as baseline fallback, Pretext `prepare()` + `layout()` for the enhanced path. Font safety constraint: avoid `system-ui` for canvas measurement; use explicit font family.

---

### Loading and Error States

**What**: Skeleton loaders while memory data fetches. Error boundary with retry action when API fails. Empty state when search returns no results.

**Complexity**: Low. React Suspense + shadcn/ui Skeleton. Standard Next.js `error.tsx` and `loading.tsx` file conventions.

**Dependencies**: Next.js App Router error/loading conventions, shadcn/ui Skeleton component.

---

### Pagination or Infinite Scroll

**What**: Memory lists can contain thousands of entries. Must page or virtually scroll rather than dump everything into the DOM.

**Complexity**: Medium. Cursor-based pagination (simpler, works with most APIs) vs. virtualization (see Differentiators below). Pagination is the table-stakes version; virtualization is the Pretext-powered upgrade.

**Dependencies**: EverMemOS API pagination params, shadcn/ui pagination controls.

---

## Differentiators

Features uniquely enabled by the Pretext integration. These cannot be replicated with pure DOM/CSS at the same quality level.

### Virtualized Memory Lists with Accurate Height Prediction

**What**: Render only the DOM nodes currently in the viewport (virtual scrolling), while maintaining correct scroll position because each item's true pixel height is known in advance via Pretext `layout()`.

**Why this is hard without Pretext**: Standard virtual list libraries (react-window, tanstack-virtual) require either fixed-height rows or expensive DOM-measure-then-layout cycles. Memory cards with variable-length text, mixed languages, and optional media have highly unpredictable heights. Guessing causes scroll jumps.

**Pretext advantage**: `prepare()` (called once per unique text) + `layout()` (pure arithmetic, O(1) per width) gives exact line count and pixel height before any DOM node is created. The virtual list can scroll 10,000 memories smoothly.

**Complexity**: High. Requires: (a) a React hook wrapping `prepare()` with a WeakMap cache keyed on text content, (b) a resize observer that triggers `layout()` on width change, (c) integration with a virtual list library using the measured heights. SSR must render a placeholder height and re-measure on hydration.

**Dependencies**: Pretext `prepare()` / `layout()` APIs, `@tanstack/react-virtual` (or similar), ResizeObserver, client-only boundary for measurement.

---

### Masonry / Editorial Layout for Memory Cards

**What**: A Pinterest-style two- or three-column grid where cards are packed tightly by height rather than aligned to a fixed row grid. Short cards fill gaps left by tall cards. The result looks intentional and editorial rather than padded.

**Why this is hard without Pretext**: CSS `columns` or `grid` masonry (draft spec, not widely supported) lay out columns but cannot know the true height of a card before paint. Server-side masonry requires either guessing or hydration flicker.

**Pretext advantage**: Because card heights are known before render, masonry column assignment can be computed server-side or in a first pass before paint, eliminating layout shift entirely.

**Complexity**: High. Column assignment algorithm (shortest-column greedy) is simple, but correct height computation for each card (including heading, body text, metadata row, optional tags) requires Pretext measuring each text segment. Edge case: cards with embedded media need a two-phase measure (text measured by Pretext, image dimensions from metadata).

**Dependencies**: Pretext `prepare()` / `layoutWithLines()` for multi-segment cards, custom column-assignment layout engine, Next.js dynamic import to keep Pretext client-only.

---

### Shrinkwrap Text Containers

**What**: A container element whose width and height are exactly tight around its text content — no excess padding, no overflow. Useful for speech bubble overlays in conversation views, inline entity labels, and highlight callouts.

**Why this is hard without Pretext**: `width: fit-content` works for single-line text. Multi-line text with a max-width constraint requires the browser to paint before the parent knows the final height, causing reflow. The container cannot reliably be sized before paint without knowing the wrapped line count.

**Pretext advantage**: `layout()` returns exact `width` and `height` for any text at any container width. The container can be sized absolutely before paint.

**Complexity**: Medium. Straightforward React component (`<ShrinkwrapText>`): call `prepare()` on mount, call `layout()` with the available width, set explicit `width`/`height` style. The tricky part is the available-width measurement chicken-and-egg: solve by measuring the parent container width via `useLayoutEffect` before the text render.

**Dependencies**: Pretext `prepare()` / `layout()`, `useLayoutEffect` for pre-paint sizing, client-only boundary.

---

### Multilingual Text Rendering (CJK, Arabic, Emoji, Mixed-Bidi)

**What**: Memory content from a global AI agent system contains Chinese, Japanese, Korean, Arabic, Hebrew, emoji, and mixed-direction text. All must lay out correctly — no invisible characters, no garbled directionality, proper line-breaking at Unicode boundaries.

**Why this is hard without Pretext**: CSS handles bidi and basic CJK line-breaking, but accurate measurement (for virtualization or masonry) requires knowing how the browser will actually wrap each script. Canvas measurement with the wrong font produces widths that do not match the DOM, causing misaligned layouts.

**Pretext advantage**: Pretext measures text via the same canvas API the browser uses for rendering, using explicit font specifications. With correct font registration (avoid `system-ui` — use `-apple-system, BlinkMacSystemFont, "Noto Sans CJK SC", sans-serif` explicitly), measured widths match rendered widths. Arabic and CJK break correctly because Pretext delegates breaking to the browser's `measureText`.

**Complexity**: Medium. Most complexity is in font configuration: ensuring the canvas font string matches the CSS font string exactly. RTL text requires setting `direction` on the canvas context before measurement. Emoji measurement needs special handling (emoji are typically wider than their nominal em-square).

**Dependencies**: Pretext `prepare()` with explicit font string, CSS `direction` + `unicode-bidi` for container, font loading strategy (next/font or explicit font-face declarations).

---

### Obstacle-Aware Text Flow

**What**: Text that flows around an embedded object — a memory timestamp badge, a profile avatar, an action icon pinned to the right — without the text and obstacle overlapping. Think CSS `float` but with pixel-accurate flow rather than block-level approximation.

**Why this is hard without Pretext**: CSS `shape-outside` achieves this for floats but requires the float to be a child of the text container and has poor support for dynamic sizing. Absolute-positioned obstacles cannot participate in text flow at all with pure CSS.

**Pretext advantage**: Pretext `layoutWithLines()` + `layoutNextLine()` accept obstacle rectangles as input and route each text line around them. The obstacle can be absolutely positioned and dynamically sized — Pretext just needs its bounding rect.

**Complexity**: High. Requires: (a) measuring the obstacle element's bounding rect before layout (useLayoutEffect), (b) passing obstacle rects to Pretext layout, (c) absolutely positioning each text line at the coordinates Pretext returns. This is the most complex Pretext integration pattern and should be a later-phase feature.

**Dependencies**: Pretext `layoutWithLines()` / `layoutNextLine()` with obstacle parameter, `getBoundingClientRect()` on obstacle elements, custom line-positioning renderer component.

---

### Interactive Pretext Demo Pages

**What**: Dedicated pages in the Hub showcasing Pretext capabilities: (a) bubble demo — speech bubbles that shrinkwrap around conversation text, (b) dynamic-layout demo — text reflows in real time as the user drags a resize handle, (c) masonry demo — a grid that packs cards by true height. These serve as both showcase and documentation for the integration.

**Complexity**: Medium. The demos are self-contained pages that import Pretext directly. The main work is porting the existing Pretext demo HTML/JS examples to Next.js React components. SSR must be disabled for these pages (Canvas API required). Interactive elements (drag handles) use standard pointer event handlers.

**Dependencies**: Pretext full API surface, Next.js `dynamic(() => import(...), { ssr: false })` for the demo components, shadcn/ui Slider for resize controls.

---

## Anti-Features

Things to deliberately not build, with rationale.

### Full Text Editor

**Why not**: Pretext is a read-only layout engine. It has no concept of cursor position, selection, composition events, or input handling. Building an editor would require a completely separate stack (ProseMirror, Lexical, or CodeMirror). EverMemOS memory content is created by AI agents, not end users typing in the Hub. There is no product requirement for in-Hub editing.

**Risk if built**: Massive scope expansion, ongoing maintenance burden, and a feature that competes with the EverMemOS backend's own memory creation APIs.

---

### Real-Time Collaboration

**Why not**: Memory content in EverMemOS is owned by AI agents and updated asynchronously. There is no multi-user simultaneous editing use case. Real-time collaboration requires WebSocket infrastructure (Socket.io, Liveblocks, or Yjs), presence indicators, conflict resolution — none of which are in scope for a read-focused visualization hub.

**Risk if built**: Infrastructure complexity that dwarfs the rendering work, and a feature nobody asked for.

---

### Custom Font Rendering Engine

**Why not**: Pretext deliberately delegates font measurement to the browser's canvas `measureText`. Rolling a custom font rasterizer (like HarfBuzz-in-WASM) would be a multi-month research project, would bloat the bundle, and would duplicate work the browser already does correctly. The constraint to avoid `system-ui` is a configuration issue, not a signal to replace the rendering stack.

**Risk if built**: Bundle size explosion (+5–10 MB for a WASM font engine), rendering inconsistencies between the custom engine and actual browser paint, and a maintenance burden with no product benefit.

---

### Offline / Service Worker Caching of Memory Content

**Why not**: Memory content is dynamic, agent-written, and changes frequently. Aggressive offline caching creates stale-data UX (users see old memories). Implementing cache invalidation correctly for EverMemOS's multi-tenant, agent-driven writes is non-trivial. Next.js's built-in static asset caching handles JS/CSS; memory data should always be fresh from the API.

**Risk if built**: Users trust stale memories, creating incorrect mental models of their agent's state.

---

### Rich Media Attachments (Video, Audio)

**Why not**: EverMemOS memories are text-based (conversations, episodes, profiles). There is no current API for binary media attachments. Adding video/audio player support requires significant additional infrastructure (media storage, streaming, transcoding) that is outside both the EverMemOS backend scope and the Pretext integration focus.

**Risk if built**: Scope creep into a media platform. Address only after the EverMemOS API exposes media endpoints.
