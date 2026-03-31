---
phase: 01
plan: 03
status: complete
---
# Summary: SSR-Safe Sandbox Page

## What was built
- `/sandbox` route proving SSR-safe client hydration end-to-end
- Server Component page (`page.tsx`) renders page shell with metadata, no Pretext imports
- `SandboxBlockLoader` Client Component uses `next/dynamic` with `ssr: false` to defer `SandboxBlock` to client-only execution
- `SandboxBlock` Client Component runs the full Pretext measurement chain: `usePrepared` -> `useContainerWidth` -> `useLayout` -> exact pixel height
- Multilingual sample text: English, Chinese (CJK), Arabic (RTL), emoji
- Debug badges display `height`, `lineCount`, `containerWidth`, `segments`, and `font` values
- Shimmer and pulse keyframe animations added to `globals.css` for skeleton states
- Fixed Turbopack `@pretext` alias resolution by installing pretext submodule as local file dependency

## Key files created/modified
- `hub/src/app/sandbox/page.tsx` — Server Component page (no 'use client', no Pretext imports)
- `hub/src/components/sandbox/SandboxBlock.tsx` — Client Component with full Pretext measurement chain
- `hub/src/components/sandbox/SandboxBlockLoader.tsx` — Thin Client Component wrapper for dynamic(ssr:false)
- `hub/src/app/globals.css` — Added shimmer + pulse keyframe animations
- `hub/next.config.ts` — Added turbopack.root, changed resolveAlias to use @chenglou/pretext
- `hub/package.json` — Added @chenglou/pretext as local file dependency

## Decisions made
- **SandboxBlockLoader wrapper**: Next.js 16 forbids `ssr: false` in Server Components (error: "ssr: false is not allowed with next/dynamic in Server Components"). Created a thin Client Component wrapper (`SandboxBlockLoader.tsx`) that uses `dynamic(ssr: false)` to load `SandboxBlock`, while `page.tsx` remains a pure Server Component.
- **Local file dependency for @pretext**: Turbopack's `resolveAlias` doesn't support absolute file paths (treats them as "server relative" which is unimplemented). Solved by: (1) `npm install --save ../pretext` to create a symlink in `node_modules/@chenglou/pretext`, (2) aliasing `@pretext` to `@chenglou/pretext` in resolveAlias, (3) setting `turbopack.root` to the repo root so the submodule is within Turbopack's file scope.
- **Kept page.tsx as pure Server Component**: Despite the `ssr: false` limitation, the page remains free of any Pretext imports or `'use client'` directive. The SSR boundary is enforced by the loader wrapper.

## Self-Check
- [x] `hub/src/app/sandbox/page.tsx` exists and is a Server Component (no 'use client')
- [x] `hub/src/components/sandbox/SandboxBlock.tsx` exists with 'use client' and full measurement chain
- [x] `hub/src/components/sandbox/SandboxBlockLoader.tsx` exists with dynamic(ssr: false)
- [x] No `import.*@pretext` or `import.*lib/pretext` in page.tsx
- [x] No `system-ui` in integration code (only in warning comments in fonts.ts)
- [x] `PRETEXT_FONT` used in SandboxBlock (import + usage)
- [x] Multilingual text includes English, CJK, Arabic, emoji
- [x] Debug badges with data-testid attributes for height, lineCount, containerWidth, segments, font
- [x] `npx tsc --noEmit` exits 0
- [x] `npm run build` exits 0 (no SSR canvas errors)
- [x] Shimmer and pulse keyframe animations in globals.css

**PASSED**
