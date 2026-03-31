// hub/src/lib/pretext/useLayout.ts
// CLIENT ONLY — do not import from Server Components or Route Handlers
'use client'

import { useMemo } from 'react'
import { layout, type PreparedText, type LayoutResult } from '@pretext'

// layout() is pure arithmetic (~0.0002ms per call) — no canvas, no DOM, no allocs.
// It is safe to call in useMemo. Returns null while prepared is loading or width is 0.
export function useLayout(
  prepared: PreparedText | null,
  width: number,
  lineHeight: number,
): LayoutResult | null {
  return useMemo(() => {
    // Guard: skip layout while prepared is still loading or container has no width.
    // width <= 0 on first render before ResizeObserver fires (even with offsetWidth init).
    if (prepared === null || width <= 0) return null
    return layout(prepared, width, lineHeight)
  }, [prepared, width, lineHeight])
}
