'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TypeBadge } from './TypeBadge'
import type { MemoryType } from '@shared/types'
import { format } from 'date-fns'

type MemoryCardProps = {
  id: string
  type: MemoryType
  title: string
  createdAt: string
  tags: string[]
  isExpanded: boolean
  children: React.ReactNode
  className?: string
}

export function MemoryCard({ id, type, title, createdAt, tags, isExpanded, children, className }: MemoryCardProps) {
  const router = useRouter()

  return (
    <Card
      className={cn(
        'w-full cursor-pointer border border-[var(--border)] bg-[var(--surface-secondary)]',
        'rounded-lg p-4 transition-colors duration-150',
        'hover:bg-[var(--surface-tertiary)]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
        className,
      )}
      tabIndex={0}
      role="article"
      onClick={() => router.push(`/memories/${id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          router.push(`/memories/${id}`)
        }
      }}
    >
      <CardContent className="p-0">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <TypeBadge type={type} />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] truncate leading-6">{title}</h3>
          </div>
          <time className="text-xs font-medium text-[var(--text-muted)] whitespace-nowrap" dateTime={createdAt}>
            {format(new Date(createdAt), 'MMM d, yyyy')}
          </time>
        </div>
        <div className={cn('transition-[height] duration-200 ease-out overflow-hidden')}>
          {children}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map((tag) => (
              <span key={tag} className="text-xs font-medium text-[var(--text-muted)] bg-[var(--surface-tertiary)] px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
