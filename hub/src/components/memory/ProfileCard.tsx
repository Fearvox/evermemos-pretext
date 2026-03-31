'use client'

import { useRef } from 'react'
import { usePrepared, useLayout, useContainerWidth, PRETEXT_FONT, PRETEXT_LINE_HEIGHT } from '@/lib/pretext'
import { SearchHighlight } from './SearchHighlight'
import type { Profile } from '@shared/types'

const COMPACT_CHAR_LIMIT = 200

export function ProfileCardContent({ profile, isExpanded, searchQuery }: { profile: Profile; isExpanded: boolean; searchQuery?: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const containerWidth = useContainerWidth(containerRef)
  const descriptionText = isExpanded ? profile.description : profile.description.length > COMPACT_CHAR_LIMIT ? profile.description.slice(0, COMPACT_CHAR_LIMIT) + '...' : profile.description
  const { prepared } = usePrepared(descriptionText, PRETEXT_FONT)
  const layoutResult = useLayout(prepared, containerWidth, PRETEXT_LINE_HEIGHT)

  return (
    <div ref={containerRef}>
      <div className="mb-3 space-y-1">
        <p className="text-lg font-semibold text-[var(--text-primary)] leading-6">{profile.name}</p>
        <p className="text-xs font-medium text-[var(--text-muted)]">{profile.role}</p>
      </div>
      {profile.fields.length > 0 && (
        <div className="mb-3 space-y-1">
          {profile.fields.map((field) => (
            <div key={field.label} className="flex gap-2 text-sm">
              <span className="text-[var(--text-muted)] font-medium shrink-0">{field.label}:</span>
              <span className="text-[var(--text-secondary)]">{field.value}</span>
            </div>
          ))}
        </div>
      )}
      <div className="pretext-block text-[var(--text-secondary)]" style={layoutResult ? { height: `${layoutResult.height}px` } : { minHeight: '24px' }}>
        <SearchHighlight text={descriptionText} query={searchQuery} />
      </div>
    </div>
  )
}
