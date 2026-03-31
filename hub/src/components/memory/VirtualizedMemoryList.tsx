'use client'

import { useRef, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useMemories, type MemoryFilters } from '@/hooks/useMemories'
import { MemoryCard } from './MemoryCard'
import { EpisodeCardContent } from './EpisodeCard'
import { ProfileCardContent } from './ProfileCard'
import { KnowledgeBlockContent } from './KnowledgeBlock'
import { MemoryCardSkeleton } from './MemoryCardSkeleton'
import { EmptyState } from './EmptyState'
import { PaginationIndicator } from './PaginationIndicator'
import type { MemoryItem } from '@shared/types'

type VirtualizedMemoryListProps = {
  filters: MemoryFilters
  isExpanded: boolean
  searchQuery?: string | null
}

const OVERSCAN = 5
const ESTIMATE_HEIGHT = 180

function getMemoryTitle(item: MemoryItem): string {
  switch (item.type) {
    case 'episode': return item.title
    case 'profile': return item.name
    case 'knowledge': return item.subject
  }
}

function MemoryCardRenderer({
  item,
  isExpanded,
  searchQuery,
}: {
  item: MemoryItem
  isExpanded: boolean
  searchQuery?: string | null
}) {
  return (
    <MemoryCard
      id={item.id}
      type={item.type}
      title={getMemoryTitle(item)}
      createdAt={item.createdAt}
      tags={item.tags}
      isExpanded={isExpanded}
    >
      {item.type === 'episode' && (
        <EpisodeCardContent
          turns={item.turns}
          isExpanded={isExpanded}
          searchQuery={searchQuery}
        />
      )}
      {item.type === 'profile' && (
        <ProfileCardContent
          profile={item}
          isExpanded={isExpanded}
          searchQuery={searchQuery}
        />
      )}
      {item.type === 'knowledge' && (
        <KnowledgeBlockContent
          entry={item}
          isExpanded={isExpanded}
          searchQuery={searchQuery}
        />
      )}
    </MemoryCard>
  )
}

export function VirtualizedMemoryList({
  filters,
  isExpanded,
  searchQuery,
}: VirtualizedMemoryListProps) {
  const {
    items,
    total,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useMemories(filters)

  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATE_HEIGHT,
    overscan: OVERSCAN,
    gap: 16,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const lastItem = virtualItems[virtualItems.length - 1]

  useEffect(() => {
    if (!lastItem) return
    if (
      lastItem.index >= items.length - OVERSCAN &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage()
    }
  }, [lastItem?.index, items.length, hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    parentRef.current?.scrollTo({ top: 0 })
  }, [filters.query, filters.type, filters.dateFrom, filters.dateTo])

  useEffect(() => {
    virtualizer.measure()
  }, [isExpanded, virtualizer])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <MemoryCardSkeleton />
        <MemoryCardSkeleton />
        <MemoryCardSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2 leading-8">
          Something went wrong
        </h2>
        <p className="text-base text-[var(--text-muted)] mb-4 leading-6">
          We couldn&apos;t load your memories. Please try again.
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-md bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    )
  }

  if (items.length === 0) {
    return <EmptyState />
  }

  return (
    <div>
      {searchQuery && (
        <p className="text-xs font-medium text-[var(--text-muted)] mb-3">
          {total ?? items.length} memories
        </p>
      )}

      <div
        ref={parentRef}
        className="h-[calc(100vh-120px)] overflow-auto"
      >
        <div
          className="relative w-full"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {virtualItems.map((virtualRow) => {
            const item = items[virtualRow.index]
            if (!item) return null

            return (
              <div
                key={virtualRow.key}
                ref={virtualizer.measureElement}
                data-index={virtualRow.index}
                className="absolute left-0 w-full"
                style={{
                  top: `${virtualRow.start}px`,
                }}
              >
                <MemoryCardRenderer
                  item={item}
                  isExpanded={isExpanded}
                  searchQuery={searchQuery}
                />
              </div>
            )
          })}
        </div>

        <PaginationIndicator
          isFetching={isFetchingNextPage}
          hasMore={hasNextPage ?? false}
        />
      </div>
    </div>
  )
}
