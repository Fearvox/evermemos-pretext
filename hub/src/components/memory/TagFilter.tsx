'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type TagFilterProps = {
  availableTags: string[]
  selectedTags: string[]
  onToggleTag: (tag: string) => void
}

export function TagFilter({ availableTags, selectedTags, onToggleTag }: TagFilterProps) {
  if (availableTags.length === 0) return null

  return (
    <div className="flex gap-1.5 flex-wrap" role="group" aria-label="Filter by tag">
      {availableTags.map((tag) => {
        const isActive = selectedTags.includes(tag)
        return (
          <Badge
            key={tag}
            className={cn(
              'cursor-pointer text-xs font-medium px-2 py-0.5 rounded-full border-0 transition-colors duration-150',
              isActive
                ? 'bg-[var(--surface-tertiary)] text-[var(--text-primary)]'
                : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
            )}
            onClick={() => onToggleTag(tag)}
            role="checkbox"
            aria-checked={isActive}
          >
            {tag}
          </Badge>
        )
      })}
    </div>
  )
}
