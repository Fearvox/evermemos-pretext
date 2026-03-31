// hub/src/lib/pretext/useContainerWidth.ts
// CLIENT ONLY — do not import from Server Components or Route Handlers
'use client'

import { useEffect, useRef, useState } from 'react'

// Returns the current pixel width of the element referenced by `ref`.
// Uses ResizeObserver for reactive updates and requestAnimationFrame debounce
// to coalesce burst resize events into one setState per frame.
// Reads offsetWidth immediately on mount so the first layout() call has a real
// width rather than 0 (avoids a degenerate initial layout).
export function useContainerWidth(ref: React.RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!ref.current) return

    // Initial measurement — before ResizeObserver callback fires
    setWidth(ref.current.offsetWidth)

    const observer = new ResizeObserver(() => {
      // RAF debounce: coalesce burst resize events into one setState per frame.
      // rafRef is a useRef (not state) so scheduling does not trigger re-renders.
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        if (ref.current) {
          setWidth(ref.current.offsetWidth)
        }
        rafRef.current = null
      })
    })

    observer.observe(ref.current)

    return () => {
      observer.disconnect()
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [ref])

  return width
}
