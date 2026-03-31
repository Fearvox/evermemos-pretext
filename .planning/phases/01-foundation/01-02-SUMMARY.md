---
phase: 01
plan: 02
status: complete
---
# Summary: Pretext Integration Hooks

## What was built
Four React hooks forming the complete Pretext integration layer, plus a barrel index.ts for convenient imports:

1. **usePrepared** — wraps `prepare()` with module-level Map cache (keyed `font::text`), `document.fonts.ready` guard, and cancellation-safe async effect
2. **useLayout** — pure `useMemo` wrapper around `layout()` with null guards for loading state and zero-width containers
3. **useContainerWidth** — ResizeObserver-backed width measurement with RAF debounce and immediate `offsetWidth` on mount
4. **usePreparedWithSegments** — rich variant of usePrepared for bidi/CJK rendering, uses separate module-level cache
5. **index.ts barrel** — re-exports all 4 hooks, font constants, and Pretext public types

## Key files created/modified
- `hub/src/lib/pretext/usePrepared.ts` (already existed from Plan 01-01 init, unchanged)
- `hub/src/lib/pretext/useLayout.ts` (new)
- `hub/src/lib/pretext/useContainerWidth.ts` (new)
- `hub/src/lib/pretext/usePreparedWithSegments.ts` (new)
- `hub/src/lib/pretext/index.ts` (new)
- `hub/src/lib/pretext/fonts.ts` (owned by Plan 01-01, accepted their updated version with LINE_HEIGHT=24)

## Decisions made
- **fonts.ts deferred to Plan 01-01**: Since Plan 01-01 owns fonts.ts and updated PRETEXT_LINE_HEIGHT from 1.5 to 24 (pixel value instead of ratio), accepted their version as canonical.
- **usePrepared.ts already committed by Plan 01-01**: The initial Next.js setup commit included usePrepared.ts. Our implementation matched exactly, so no changes were needed.
- **No type-check run**: The @pretext path alias resolution depends on Plan 01-01's tsconfig/next.config changes. Type checking will work once both plans' changes are integrated.

## Self-Check
PASSED — All acceptance criteria verified:
- All 4 hook files have `'use client'` directive
- All 4 hook files have `// CLIENT ONLY` comment
- `document.fonts.ready` appears only in usePrepared.ts and usePreparedWithSegments.ts
- No `system-ui` usage in any code (only in warning comments)
- Module-level caches use correct key format `${font}::${text}`
- ResizeObserver + RAF debounce pattern correct in useContainerWidth
- Barrel index.ts re-exports all hooks, constants, and types
