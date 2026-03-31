'use client'

import { SearchX } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <SearchX
        className="text-[var(--text-muted)] mb-4"
        size={48}
        strokeWidth={1.5}
      />
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2 leading-8">
        No memories found
      </h2>
      <p className="text-base text-[var(--text-muted)] text-center max-w-sm leading-6">
        Try adjusting your search or filters to find what you&apos;re looking for.
      </p>
    </div>
  )
}
