'use client'

import { useEffect, useState } from 'react'
import { fetchMemoryById } from '@shared/api'
import { MemoryCard } from './MemoryCard'
import { EpisodeCardContent } from './EpisodeCard'
import { ProfileCardContent } from './ProfileCard'
import { KnowledgeBlockContent } from './KnowledgeBlock'
import { MemoryCardSkeleton } from './MemoryCardSkeleton'
import type { MemoryItem } from '@shared/types'

function getMemoryTitle(item: MemoryItem): string {
  switch (item.type) {
    case 'episode': return item.title
    case 'profile': return item.name
    case 'knowledge': return item.subject
    default: return ''
  }
}

export function MemoryDetailLoader({ id }: { id: string }) {
  const [item, setItem] = useState<MemoryItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)
    setError(null)

    fetchMemoryById(id, controller.signal)
      .then((data) => {
        if (data) {
          setItem(data)
        } else {
          setError('Memory not found')
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError('Failed to load memory')
      })
      .finally(() => setIsLoading(false))

    return () => controller.abort()
  }, [id])

  if (isLoading) return <MemoryCardSkeleton />

  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
          {error ?? 'Memory not found'}
        </h2>
      </div>
    )
  }

  return (
    <MemoryCard
      id={item.id}
      type={item.type}
      title={getMemoryTitle(item)}
      createdAt={item.createdAt}
      tags={item.tags}
      isExpanded={true}
    >
      {item.type === 'episode' && (
        <EpisodeCardContent turns={item.turns} isExpanded={true} />
      )}
      {item.type === 'profile' && (
        <ProfileCardContent profile={item} isExpanded={true} />
      )}
      {item.type === 'knowledge' && (
        <KnowledgeBlockContent entry={item} isExpanded={true} />
      )}
    </MemoryCard>
  )
}
