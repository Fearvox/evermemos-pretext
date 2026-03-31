// hub/src/lib/pretext/usePreparedWithSegments.ts
// CLIENT ONLY — do not import from Server Components or Route Handlers
'use client'

import { useEffect, useState } from 'react'
import { prepareWithSegments, type PreparedTextWithSegments } from '@pretext'

// Separate module-level cache from usePrepared's cache.
// A text can exist in both caches (if both hooks are used for the same string) — this is safe.
// Key format: `${font}::${text}` — same as preparedCache for consistency.
const preparedWithSegmentsCache = new Map<string, PreparedTextWithSegments>()

// Rich variant of usePrepared for bidi/CJK rendering that needs segment arrays.
// Returns PreparedTextWithSegments which exposes segments: string[] for custom rendering.
// Use this when you need layoutWithLines(), walkLineRanges(), or layoutNextLine() —
// all require PreparedTextWithSegments, not PreparedText.
// For simple height measurement, prefer usePrepared + useLayout (faster).
export function usePreparedWithSegments(
  text: string,
  font: string,
): { prepared: PreparedTextWithSegments | null; isLoading: boolean } {
  const [prepared, setPrepared] = useState<PreparedTextWithSegments | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function run() {
      // Critical: await font loading before prepareWithSegments() — same requirement as prepare().
      await document.fonts.ready

      if (cancelled) return

      const key = `${font}::${text}`
      let hit = preparedWithSegmentsCache.get(key)
      if (!hit) {
        hit = prepareWithSegments(text, font)
        preparedWithSegmentsCache.set(key, hit)
      }

      if (!cancelled) {
        setPrepared(hit)
        setIsLoading(false)
      }
    }

    setIsLoading(true)
    setPrepared(null)
    void run()

    return () => {
      cancelled = true
    }
  }, [text, font])

  return { prepared, isLoading }
}
