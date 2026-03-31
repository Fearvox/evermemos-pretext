'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchMemories, type FetchMemoriesParams } from '@shared/api'
import type { MemoryItem } from '@shared/types'
import type { PaginatedResponse } from '@shared/types/pagination'

export type MemoryFilters = {
  query?: string | null
  type?: FetchMemoriesParams['type']
  tags?: string[] | null
  dateFrom?: string | null
  dateTo?: string | null
}

export function useMemories(filters: MemoryFilters = {}) {
  const queryResult = useInfiniteQuery<PaginatedResponse<MemoryItem>>({
    queryKey: ['memories', filters.query, filters.type, filters.tags, filters.dateFrom, filters.dateTo],
    queryFn: async ({ pageParam, signal }) => {
      return fetchMemories({
        cursor: pageParam as string | null,
        type: filters.type,
        query: filters.query,
        tags: filters.tags,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        signal,
      })
    },
    getNextPageParam: (lastPage) => lastPage.cursor,
    initialPageParam: null as string | null,
  })

  const items: MemoryItem[] = queryResult.data?.pages.flatMap((page) => page.data) ?? []
  const total = queryResult.data?.pages[0]?.total

  return {
    items,
    total,
    fetchNextPage: queryResult.fetchNextPage,
    hasNextPage: queryResult.hasNextPage,
    isFetchingNextPage: queryResult.isFetchingNextPage,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  }
}
