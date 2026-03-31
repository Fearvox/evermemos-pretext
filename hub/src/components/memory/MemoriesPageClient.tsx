'use client'

import { useState, useCallback } from 'react'
import { SearchBar } from './SearchBar'
import { TypeFilter } from './TypeFilter'
import { DateRangePicker } from './DateRangePicker'
import { MemoryListLoader } from './MemoryListLoader'
import type { MemoryType } from '@shared/types'
import type { DateRange } from 'react-day-picker'

export function MemoriesPageClient() {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<MemoryType | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const handleQueryChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleToggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }, [])

  const filters = {
    query: searchQuery || null,
    type: typeFilter,
    tags: selectedTags.length > 0 ? selectedTags : null,
    dateFrom: dateRange?.from?.toISOString() ?? null,
    dateTo: dateRange?.to?.toISOString() ?? null,
  }

  return (
    <div>
      <div className="sticky top-0 z-10 bg-[var(--surface-dominant)]/95 backdrop-blur-sm border-b border-[var(--border)] pb-4 mb-6 -mx-4 px-4 lg:-mx-8 lg:px-8 pt-2">
        <div className="flex items-center gap-3 mb-3">
          <SearchBar onQueryChange={handleQueryChange} />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <TypeFilter selected={typeFilter} onChange={setTypeFilter} />
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>
      </div>

      <MemoryListLoader
        filters={filters}
        searchQuery={searchQuery || null}
        selectedTags={selectedTags}
        onToggleTag={handleToggleTag}
      />
    </div>
  )
}
