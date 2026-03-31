---
phase: 01
plan: 01
status: complete
---
# Summary: Next.js Hub Scaffold + Submodule Infrastructure

## What was built
- Scaffolded Next.js 16.2.1 App Router project in `hub/` with React 19.2.4, Tailwind v4, TypeScript 5.x
- Configured Turbopack `resolveAlias` and webpack fallback for `@pretext` path alias pointing to `../pretext/src/layout.ts`
- Set up TypeScript compilation boundary: hub's `tsconfig.json` excludes `../pretext/src/**` to prevent TS 6 flag conflicts
- Loaded Inter font via `next/font/google` with `--font-inter` CSS variable
- Created `PRETEXT_FONT = '16px Inter'` constant as single source of truth in `hub/src/lib/pretext/fonts.ts`
- Created `PRETEXT_LINE_HEIGHT = 24` constant (1.5 * 16px)
- Added `.pretext-block` CSS class matching the font constant exactly
- Created `scripts/setup.sh` chaining submodule init + bun build:package + npm install
- Created `vercel.json` with buildCommand, installCommand, outputDirectory for Vercel CI
- Dev server runs on port 3001 (Pretext uses 3000)

## Key files created/modified
- `hub/package.json` — Next.js 16.2.1 project with port 3001 scripts
- `hub/next.config.ts` — transpilePackages + turbopack.resolveAlias + webpack alias
- `hub/tsconfig.json` — @pretext path alias + ../pretext/src exclusion
- `hub/src/app/layout.tsx` — Inter font via next/font/google, EverMemOS Hub metadata
- `hub/src/app/globals.css` — .pretext-block class, Inter font body
- `hub/src/lib/pretext/fonts.ts` — PRETEXT_FONT and PRETEXT_LINE_HEIGHT constants
- `hub/src/lib/pretext/usePrepared.ts` — prepare() hook with module-level cache
- `hub/src/lib/pretext/useLayout.ts` — layout() hook (pure arithmetic, useMemo)
- `hub/src/lib/pretext/useContainerWidth.ts` — ResizeObserver + RAF debounce hook
- `scripts/setup.sh` — setup script for submodule + build + install
- `vercel.json` — Vercel CI configuration

## Decisions made
- **Turbopack config location**: Next.js 16 moved `turbo` from `experimental.turbo` to top-level `turbopack`. Updated accordingly.
- **PRETEXT_LINE_HEIGHT**: Set to `24` (pixels) rather than `1.5` (ratio) for direct use with Pretext's `layout()` API which expects pixel values.
- **jsx**: Kept `react-jsx` from create-next-app scaffold (not `preserve` as plan suggested) — this is what Next.js 16 generates by default.
- **Skipped postinstall check**: Omitted the postinstall script that checks for pretext/dist/layout.js — this would break `npm install` on fresh clones before setup.sh runs. The setup.sh script handles the correct order.

## Self-Check
- [x] hub/package.json exists with dev on port 3001
- [x] Next.js 16.2.1 and React 19.2.4 installed
- [x] next.config.ts has transpilePackages + resolveAlias + webpack alias
- [x] tsconfig.json has @pretext path and excludes ../pretext/src
- [x] PRETEXT_FONT = '16px Inter' defined, no system-ui usage
- [x] Inter loaded via next/font/google with --font-inter variable
- [x] scripts/setup.sh exists and is executable
- [x] vercel.json configured correctly
- [x] pretext/dist/layout.js and layout.d.ts present after build
- [x] tsc --noEmit passes cleanly
- [x] Dev server starts on port 3001 and serves HTML

**PASSED**
