'use client'

import { useState, useMemo, useCallback } from 'react'
import { VirtualizedMemoryList } from './VirtualizedMemoryList'
import { MemoryToolbar } from './MemoryToolbar'
import { useMemories, type MemoryFilters } from '@/hooks/useMemories'

type MemoryListLoaderProps = {
  filters: MemoryFilters
  searchQuery?: string | null
  selectedTags: string[]
  onToggleTag: (tag: string) => void
}

export function MemoryListLoader({ filters, searchQuery, selectedTags, onToggleTag }: MemoryListLoaderProps) {
  const [isCompact, setIsCompact] = useState(false)
  const { items, total } = useMemories(filters)

  const availableTags = useMemo(
    () => [...new Set(items.flatMap((item) => item.tags))].sort(),
    [items],
  )

  return (
    <>
      <MemoryToolbar
        isCompact={isCompact}
        onToggleDensity={() => setIsCompact((prev) => !prev)}
        resultCount={searchQuery ? total : undefined}
        availableTags={availableTags}
        selectedTags={selectedTags}
        onToggleTag={onToggleTag}
      />
      <VirtualizedMemoryList
        filters={filters}
        isExpanded={!isCompact}
        searchQuery={searchQuery}
      />
    </>
  )
}
