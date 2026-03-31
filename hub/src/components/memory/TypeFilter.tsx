'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { MemoryType } from '@shared/types'

const FILTER_OPTIONS: { value: MemoryType | null; label: string }[] = [
  { value: null, label: 'All' },
  { value: 'episode', label: 'Episode' },
  { value: 'profile', label: 'Profile' },
  { value: 'knowledge', label: 'Knowledge' },
]

const ACTIVE_STYLES: Record<string, string> = {
  all: 'bg-[var(--surface-tertiary)] text-[var(--text-primary)]',
  episode: 'bg-[var(--badge-episode-bg)] text-[var(--badge-episode-text)]',
  profile: 'bg-[var(--badge-profile-bg)] text-[var(--badge-profile-text)]',
  knowledge: 'bg-[var(--badge-knowledge-bg)] text-[var(--badge-knowledge-text)]',
}

type TypeFilterProps = {
  selected: MemoryType | null
  onChange: (type: MemoryType | null) => void
}

export function TypeFilter({ selected, onChange }: TypeFilterProps) {
  return (
    <div className="flex gap-1.5" role="group" aria-label="Filter by memory type">
      {FILTER_OPTIONS.map((option) => {
        const isActive = option.value === selected
        const styleKey = option.value ?? 'all'

        return (
          <Badge
            key={option.label}
            className={cn(
              'cursor-pointer text-xs font-medium px-2.5 py-1 rounded-full border-0 transition-colors duration-150',
              isActive
                ? ACTIVE_STYLES[styleKey]
                : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
            )}
            onClick={() => onChange(option.value)}
            role="radio"
            aria-checked={isActive}
          >
            {option.label}
          </Badge>
        )
      })}
    </div>
  )
}
