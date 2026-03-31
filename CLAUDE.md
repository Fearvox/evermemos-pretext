# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EverMemOS-Pretext: deep integration of [Pretext](https://github.com/chenglou/pretext) text layout engine into EverMemOS Hub. Two goals — use Pretext to power memory content rendering (conversations, notes, profiles) AND provide interactive Pretext demos within the Hub.

## Architecture

```
EverMemOS-Pretext/
├── pretext/                      # Git submodule → chenglou/pretext (READ-ONLY)
├── hub/                          # Next.js 16 App Router frontend
│   ├── src/
│   │   ├── app/                  # Next.js routes
│   │   ├── components/
│   │   │   ├── layout/           # Pretext-powered layout components
│   │   │   ├── demos/            # Interactive Pretext demo wrappers
│   │   │   └── memory/           # Memory content visualization
│   │   └── lib/
│   │       └── pretext/          # Pretext integration layer (hooks, wrappers)
│   └── ...
├── shared/                       # Shared types between hub and EverMemOS API
├── scripts/                      # Build, dev, deploy scripts
└── docs/                         # Architecture decisions, integration notes
```

## Critical Rules

- **Never modify `pretext/` submodule directly.** All Pretext changes go upstream to chenglou/pretext. If you need a local patch, document it in `docs/` and track the upstream PR.
- **Pretext's `prepare()` is expensive, `layout()` is cheap.** Cache `prepare()` results; only call `layout()` on resize. Never call `prepare()` in a render loop.
- **Pretext requires browser Canvas API** for measurement. Server-side rendering must skip Pretext measurement or use a Canvas polyfill.

## Commands

```bash
# Setup
git submodule update --init --recursive   # Required after clone
cd pretext && bun install                 # Pretext dependencies
cd hub && npm install                     # Hub dependencies

# Development
cd hub && npm run dev                     # Hub dev server (Next.js)
cd pretext && bun start                   # Pretext standalone dev server (port 3000)

# Verification
cd hub && npx tsc --noEmit                # Hub type check
cd pretext && bun run check               # Pretext type check + oxlint
cd pretext && bun test                    # Pretext tests
```

## Tech Stack

| Layer | Tech | Notes |
|-------|------|-------|
| Hub frontend | Next.js 16 + React + Tailwind + shadcn/ui | App Router, Server Components default |
| Text engine | @chenglou/pretext (submodule) | Bun runtime, TypeScript 6, oxlint |
| Backend API | EverMemOS (external) | Python FastAPI, connect via REST |
| Package manager | npm (hub), bun (pretext) | Two separate dependency trees |

## Code Style

- Hub: follow Next.js 16 conventions — Server Components by default, `'use client'` only when needed
- Pretext integration code (`hub/src/lib/pretext/`): match Pretext's style — `.js` specifiers in imports, allocation-light
- All request APIs are async in Next.js 16: `await cookies()`, `await headers()`, `await params`

## Pretext API Quick Reference

```ts
// Fast path: height measurement without DOM
const prepared = prepare(text, '16px Inter')
const { height, lineCount } = layout(prepared, containerWidth, lineHeight)

// Rich path: line-by-line layout
const prepared = prepareWithSegments(text, '18px "Helvetica Neue"')
const { lines } = layoutWithLines(prepared, maxWidth, lineHeight)

// Shrinkwrap: tightest container width
walkLineRanges(prepared, maxWidth, line => { /* line.width */ })

// Variable-width layout (text around obstacles)
layoutNextLine(prepared, cursor, currentLineWidth, lineHeight)
```

## Gotchas

- Pretext uses `system-ui` font sparingly — canvas and DOM can resolve different fonts on macOS
- Pretext's Bun dev server uses port 3000; Hub dev server should use a different port (3001)
- Emoji measurement has auto-correction per font size; don't assume fixed emoji widths
- CJK text requires special handling: kinsoku rules, astral ideographs beyond BMP
- Bidi (RTL) metadata is only on the `prepareWithSegments()` path, not the fast `prepare()` path

## Subdirectory Instructions

Module-specific CLAUDE.md files can be added to `hub/`, `shared/`, etc. for deeper guidance as the project grows.

<!-- GSD:project-start source:PROJECT.md -->
## Project

**EverMemOS-Pretext**

A deep integration of [Pretext](https://github.com/chenglou/pretext) — a pure TypeScript multiline text measurement and layout engine — into the EverMemOS Hub page. The project delivers both a Pretext-powered memory content rendering system (conversations, notes, user profiles) and interactive Pretext demos (bubbles, masonry, dynamic layout) as part of the Hub experience.

**Core Value:** Memory content in EverMemOS Hub must render beautifully with proper text layout — supporting all languages (CJK, Arabic, emoji, mixed-bidi), enabling virtualization without guesstimates, and unlocking advanced layouts (masonry, shrinkwrap, obstacle-aware flow) that DOM reflow alone cannot achieve efficiently.

### Constraints

- **Runtime**: Pretext requires browser Canvas API for measurement — SSR must defer to client
- **Submodule**: Pretext source is read-only; changes must go through upstream PR
- **Dual package managers**: npm (Hub) and bun (Pretext) coexist
- **Port allocation**: Pretext dev server uses :3000, Hub must use :3001
- **Font safety**: `system-ui` is unsafe for accuracy on macOS (canvas vs DOM resolve differently)
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Framework
| Package | Version | Rationale |
|---------|---------|-----------|
| `next` | `^16.1.0` | App Router is stable; React Compiler support is stable in 16; Turbopack is the default bundler. Breaking change from 15: `proxy.ts` replaces `middleware.ts`, all async request APIs (`cookies`, `headers`, `params`) require `await`. |
| `react` + `react-dom` | `^19.2.0` | Required peer of Next.js 16. React Compiler auto-memoizes components — valuable for Pretext integration where expensive `prepare()` calls must not re-run on layout passes. |
| `typescript` | `^5.8.x` (hub); `6.0.2` (pretext submodule) | Pretext itself is compiled with TS 6. The hub should stay on TS 5.x latest stable until TS 6 is the npm ecosystem default — the two compilations are independent (different `tsconfig.json` roots). |
### Pretext Integration Layer
### Canvas / SSR Boundary
### Virtualization
| Package | Version | Rationale |
|---------|---------|-----------|
| `@tanstack/react-virtual` | `^3.x` | The only viable choice for Pretext integration. Supports dynamic/variable item heights via `estimateSize` + `measureElement` callbacks. Pretext provides exact heights — pass them to `measureElement` after `layout()` returns. React-window is rejected (static heights only, unmaintained). React Virtualized is rejected (aging architecture, unmaintained). |
### UI Components and Styling
| Package | Version | Rationale |
|---------|---------|-----------|
| Tailwind CSS | `^4.x` | v4 is the current stable; required by shadcn/ui. OKLCH color space replaces HSL. No `tailwind.config.js` — configuration lives in `globals.css` via `@theme`. |
| shadcn/ui | current CLI (not a versioned package) | Component collection, not a dependency. Add components via `npx shadcn@latest add <component>`. Keep CLI-generated files in `components/ui/`; custom wrappers in `components/shared/`. |
| `next-themes` | `^0.4.x` | Class-based dark mode toggle. Inject `ThemeProvider` in the root layout. Add a blocking inline script in `<head>` to read `localStorage` and apply the theme class before render — prevents white flash. shadcn/ui dark mode works out of the box with this setup. |
| `tailwind-merge` + `clsx` | latest | Use `cn()` helper (re-exported by shadcn/ui setup) everywhere. Never concatenate Tailwind classes with template literals. |
### Data Fetching and State
| Package | Version | Rationale |
|---------|---------|-----------|
| Native `fetch` (Server Components) | — | EverMemOS FastAPI backend is a REST API. Fetch directly in Server Components for memory list/detail pages — no extra library needed, Next.js 16's `'use cache'` directive handles caching at the RSC layer. |
| `@tanstack/react-query` | `^5.x` | For client-side interactive features that need refetch, optimistic updates, or cache invalidation (e.g., live memory search, real-time profile updates). Do not use for static/SSR data that can be fetched in Server Components. |
| Zod | `^3.x` | Validate EverMemOS API responses at the boundary. Define schemas in `shared/` so both the hub and any future tooling share types. |
### Fonts
## Integration Patterns
### The Two-Phase Pretext Model in React
- `prepare(text, font)` — **expensive, one-time per (text, font) pair.** Run in `useEffect` or `useLayoutEffect`, never in render. Cache results in a `useRef` map or a module-level `Map` keyed by `(text, font)`.
- `layout(prepared, maxWidth, lineHeight)` — **cheap, pure arithmetic.** Safe to call in a `useMemo` or even during render once `prepared` is available. Rerun on every resize via `ResizeObserver`.
### ResizeObserver + Layout Loop
### Module-Level Prepare Cache
### Demo Pages: `ssr: false` + Canvas Direct Draw
### Submodule Build Boundary
## What NOT to Use
### react-window / react-virtualized
### `system-ui` as the Pretext font argument
### canvas-polyfills (node-canvas, jest-canvas-mock) in SSR
### `react-spring` or `framer-motion` for layout animations triggered by Pretext reflow
### `getServerSideProps` / Pages Router
### Webpack custom loaders for the Pretext submodule
### `useEffect` for initial height measurement (use `useLayoutEffect` instead)
### Bundling CJK font subsets into the hub build
### `@tanstack/react-query` for static memory data
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
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
