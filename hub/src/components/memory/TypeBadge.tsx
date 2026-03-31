'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { MemoryType } from '@shared/types'

const BADGE_STYLES: Record<MemoryType, string> = {
  episode: 'bg-[var(--badge-episode-bg)] text-[var(--badge-episode-text)]',
  profile: 'bg-[var(--badge-profile-bg)] text-[var(--badge-profile-text)]',
  knowledge: 'bg-[var(--badge-knowledge-bg)] text-[var(--badge-knowledge-text)]',
}

const BADGE_LABELS: Record<MemoryType, string> = {
  episode: 'Episode',
  profile: 'Profile',
  knowledge: 'Knowledge',
}

export function TypeBadge({ type, className }: { type: MemoryType; className?: string }) {
  return (
    <Badge
      className={cn(
        'text-xs font-medium px-2 py-0.5 rounded-full border-0',
        BADGE_STYLES[type],
        className,
      )}
    >
      {BADGE_LABELS[type]}
    </Badge>
  )
}
