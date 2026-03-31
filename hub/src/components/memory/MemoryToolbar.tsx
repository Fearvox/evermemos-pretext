'use client'

import { DensityToggle } from './DensityToggle'
import { TagFilter } from './TagFilter'

type MemoryToolbarProps = {
  isCompact: boolean
  onToggleDensity: () => void
  resultCount?: number
  availableTags: string[]
  selectedTags: string[]
  onToggleTag: (tag: string) => void
}

export function MemoryToolbar({
  isCompact,
  onToggleDensity,
  resultCount,
  availableTags,
  selectedTags,
  onToggleTag,
}: MemoryToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <div className="flex items-center gap-3 flex-wrap min-w-0">
        {resultCount !== undefined && (
          <span className="text-xs font-medium text-[var(--text-muted)] shrink-0">
            {resultCount} memories
          </span>
        )}
        <TagFilter
          availableTags={availableTags}
          selectedTags={selectedTags}
          onToggleTag={onToggleTag}
        />
      </div>
      <DensityToggle isCompact={isCompact} onToggle={onToggleDensity} />
    </div>
  )
}
