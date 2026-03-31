# Phase 1: Foundation - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the scaffolded Next.js 16 hub, Pretext integration hooks proven SSR-safe, and dual package manager infrastructure. After this phase: a sandbox page renders multilingual text measured by Pretext, height is displayed, and the build passes on Vercel.

</domain>

<decisions>
## Implementation Decisions

### Submodule Consumption
- **D-01:** Consume Pretext via path alias (`@pretext` → `../pretext/src/layout.ts`) + `transpilePackages: ['@chenglou/pretext']` + Turbopack `resolveAlias` in `next.config.ts`. No `npm link`, no separate `bun build:package` during dev.
- **D-02:** For type-checking and production build, `bun run build:package` in pretext submodule generates `dist/layout.d.ts`. Hub's tsconfig references dist types only, excludes `../pretext/src/**`.

### Font Configuration
- **D-03:** `PRETEXT_FONT` constant = `'16px Inter'` — used in both CSS class and every `prepare()` call. Inter loaded via `next/font/google` in root layout.
- **D-04:** Never use `system-ui`, `sans-serif`, or CSS variables as Pretext font arguments. Canvas and DOM resolve these differently on macOS.
- **D-05:** CJK font subsets loaded lazily (not bundled in root layout) — deferred to Phase 2.

### Sandbox Test Page
- **D-06:** Sandbox page at `/sandbox` renders a single text block with multilingual content (English + CJK + Arabic + emoji). Displays measured height and lineCount from Pretext. Proves SSR-safe client hydration works.
- **D-07:** Sandbox page is a Server Component (no `'use client'`). `SandboxBlock` is imported via `dynamic(..., { ssr: false })` to enforce the SSR boundary — Pretext hooks never execute on the server. The `loading` prop renders the skeleton during SSR and before hydration completes.

### Hook API Design
- **D-08:** `usePrepared(text, font)` — module-level `Map<string, PreparedText>` cache keyed by `${font}::${text}` (font first so font changes invalidate cleanly). Awaits `document.fonts.ready` before first `prepare()` call. Returns `{ prepared, isLoading }`.
- **D-09:** `useLayout(prepared, width, lineHeight)` — calls `layout()` synchronously. Returns `{ height, lineCount }`. Safe to call in `useLayoutEffect`.
- **D-10:** `useContainerWidth(ref)` — `ResizeObserver` + `requestAnimationFrame` debounce. Returns pixel width.
- **D-11:** `usePreparedWithSegments(text, font)` — rich path for Phase 2 bidi rendering. Implemented now, tested in sandbox with Arabic text.

### Infrastructure
- **D-12:** Hub dev server on port 3001 (Pretext uses 3000).
- **D-13:** `scripts/setup.sh` chains: `git submodule update --init --recursive && cd pretext && bun install && bun run build:package`.
- **D-14:** Vercel build command: `bash scripts/setup.sh && cd hub && npm run build`.

### Claude's Discretion
- Exact Tailwind v4 theme configuration (OKLCH tokens, dark mode palette)
- shadcn/ui component selection for sandbox page
- ESLint configuration for hub

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Pretext API
- `pretext/src/layout.ts` — Core API surface: prepare(), layout(), prepareWithSegments(), layoutWithLines(), walkLineRanges(), layoutNextLine()
- `pretext/src/measurement.ts` — Canvas measurement, segment metrics cache, emoji correction
- `pretext/src/analysis.ts` — Text analysis phase, segmentation, glue rules
- `pretext/CLAUDE.md` — Implementation notes, constraints, gotchas

### Research
- `.planning/research/STACK.md` — Stack decisions with rationale
- `.planning/research/ARCHITECTURE.md` — Component boundaries, data flow, SSR strategy
- `.planning/research/PITFALLS.md` — Critical pitfalls and prevention strategies

### Next.js 16
- Next.js 16 upgrade guide: proxy.ts replaces middleware.ts, async request APIs
- `transpilePackages` + Turbopack `resolveAlias` for submodule consumption

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `pretext/src/layout.ts` — All public APIs (prepare, layout, prepareWithSegments, layoutWithLines, walkLineRanges, layoutNextLine, setLocale, clearCache)
- `pretext/pages/demos/` — Reference implementations for bubbles, dynamic-layout, masonry (vanilla TS, to be ported in Phase 3)

### Established Patterns
- Pretext uses `.js` specifiers in `.ts` imports — hub integration layer should NOT follow this pattern (it's a Pretext-specific convention for tsc emit)
- Pretext's measurement cache is `Map<font, Map<segment, metrics>>` — our `usePrepared` cache sits above this at the `PreparedText` level

### Integration Points
- `pretext/src/layout.ts` exports → `hub/src/lib/pretext/` hooks → `hub/src/components/` Client Components
- `next.config.ts` → transpilePackages + resolveAlias pointing to `../pretext/src/layout.ts`

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for Phase 1 scaffold.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-31*
