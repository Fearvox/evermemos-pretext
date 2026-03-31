// hub/src/lib/pretext/usePrepared.ts
// CLIENT ONLY — do not import from Server Components or Route Handlers
'use client'

import { useEffect, useState } from 'react'
import { prepare, type PreparedText } from '@pretext'

// Module-level cache: survives component unmount/remount without re-preparing.
// Key format: `${font}::${text}` — font first so font changes invalidate cleanly.
// This cache is intentionally module-global, not per-component, to avoid
// redundant prepare() calls when the same text appears in multiple components.
const preparedCache = new Map<string, PreparedText>()

export function usePrepared(
  text: string,
  font: string,
): { prepared: PreparedText | null; isLoading: boolean } {
  const [prepared, setPrepared] = useState<PreparedText | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function run() {
      // Critical: await font loading before prepare() or canvas measures fallback font.
      // next/font/google with display: 'swap' preloads fonts but does not guarantee
      // the font is in the browser cache when the first effect fires on cold load.
      await document.fonts.ready

      if (cancelled) return

      const key = `${font}::${text}`
      let hit = preparedCache.get(key)
      if (!hit) {
        hit = prepare(text, font)
        preparedCache.set(key, hit)
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
