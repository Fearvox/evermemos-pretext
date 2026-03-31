'use client'

import { useRef } from 'react'
import { usePrepared, useLayout, useContainerWidth, PRETEXT_FONT, PRETEXT_LINE_HEIGHT } from '@/lib/pretext'
import { SearchHighlight } from './SearchHighlight'
import type { KnowledgeEntry } from '@shared/types'

const COMPACT_CHAR_LIMIT = 200

export function KnowledgeBlockContent({ entry, isExpanded, searchQuery }: { entry: KnowledgeEntry; isExpanded: boolean; searchQuery?: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const containerWidth = useContainerWidth(containerRef)
  const contentText = isExpanded ? entry.content : entry.content.length > COMPACT_CHAR_LIMIT ? entry.content.slice(0, COMPACT_CHAR_LIMIT) + '...' : entry.content
  const { prepared } = usePrepared(contentText, PRETEXT_FONT)
  const layoutResult = useLayout(prepared, containerWidth, PRETEXT_LINE_HEIGHT)

  return (
    <div ref={containerRef}>
      <p className="text-lg font-semibold text-[var(--text-primary)] leading-6 mb-2">{entry.subject}</p>
      <div className="pretext-block text-[var(--text-secondary)]" style={layoutResult ? { height: `${layoutResult.height}px` } : { minHeight: '24px' }}>
        <SearchHighlight text={contentText} query={searchQuery} />
      </div>
    </div>
  )
}
