'use client'

import { Loader2 } from 'lucide-react'

type PaginationIndicatorProps = {
  isFetching: boolean
  hasMore: boolean
}

export function PaginationIndicator({ isFetching, hasMore }: PaginationIndicatorProps) {
  if (isFetching) {
    return (
      <div className="flex items-center justify-center gap-2 py-6">
        <Loader2 className="h-4 w-4 animate-spin text-[var(--text-muted)]" />
        <span className="text-sm text-[var(--text-muted)]">Loading more...</span>
      </div>
    )
  }

  if (!hasMore) {
    return (
      <div className="flex items-center justify-center py-6">
        <span className="text-sm text-[var(--text-muted)]">You&apos;ve reached the end</span>
      </div>
    )
  }

  return null
}
