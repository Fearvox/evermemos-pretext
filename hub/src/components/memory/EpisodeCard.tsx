'use client'

import { useRef, useMemo } from 'react'
import { usePreparedWithSegments, useContainerWidth, PRETEXT_FONT, PRETEXT_LINE_HEIGHT } from '@/lib/pretext'
import { findTightWrapMetrics } from '@/lib/pretext/shrinkwrap'
import { cn } from '@/lib/utils'
import { SearchHighlight } from './SearchHighlight'
import type { ConversationTurn } from '@shared/types'

const BUBBLE_MAX_RATIO = 0.8
const BUBBLE_PADDING_H = 12
const COMPACT_MAX_TURNS = 3

function BubbleMessage({ turn, containerWidth, searchQuery }: { turn: ConversationTurn; containerWidth: number; searchQuery?: string | null }) {
  const maxBubbleWidth = Math.floor(containerWidth * BUBBLE_MAX_RATIO)
  const maxTextWidth = maxBubbleWidth - BUBBLE_PADDING_H * 2
  const { prepared, isLoading } = usePreparedWithSegments(turn.content, PRETEXT_FONT)

  const metrics = useMemo(() => {
    if (!prepared || maxTextWidth <= 0) return null
    return findTightWrapMetrics(prepared, maxTextWidth, PRETEXT_LINE_HEIGHT)
  }, [prepared, maxTextWidth])

  const bubbleWidth = metrics ? Math.ceil(metrics.maxLineWidth) + BUBBLE_PADDING_H * 2 : undefined
  const isUser = turn.role === 'user'

  return (
    <div className={cn('flex', isUser ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'pretext-block rounded-xl px-3 py-2',
          isUser ? 'bg-[var(--bubble-user-bg)] text-[var(--bubble-user-text)] rounded-bl-sm' : 'bg-[var(--bubble-agent-bg)] text-[var(--bubble-agent-text)] rounded-br-sm',
        )}
        style={{ maxWidth: `${maxBubbleWidth}px`, width: bubbleWidth ? `${bubbleWidth}px` : undefined, opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.15s' }}
      >
        <SearchHighlight text={turn.content} query={searchQuery} />
      </div>
    </div>
  )
}

export function EpisodeCardContent({ turns, isExpanded, searchQuery }: { turns: ConversationTurn[]; isExpanded: boolean; searchQuery?: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const containerWidth = useContainerWidth(containerRef)
  const visibleTurns = isExpanded ? turns : turns.slice(0, COMPACT_MAX_TURNS)
  const hiddenCount = turns.length - visibleTurns.length

  return (
    <div ref={containerRef} className="flex flex-col gap-2">
      {containerWidth > 0 && visibleTurns.map((turn) => (
        <BubbleMessage key={turn.id} turn={turn} containerWidth={containerWidth} searchQuery={searchQuery} />
      ))}
      {!isExpanded && hiddenCount > 0 && (
        <p className="text-xs text-[var(--text-muted)] text-center mt-1">+{hiddenCount} more messages</p>
      )}
    </div>
  )
}
