'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MemoriesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Memories route error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <AlertCircle
        className="text-[var(--destructive)] mb-4"
        size={48}
        strokeWidth={1.5}
      />
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2 leading-8">
        Something went wrong
      </h2>
      <p className="text-base text-[var(--text-muted)] text-center max-w-sm mb-6 leading-6">
        We couldn&apos;t load your memories. Please try again.
      </p>
      <Button
        onClick={reset}
        className="bg-[var(--accent)] text-white hover:opacity-90"
      >
        Retry
      </Button>
    </div>
  )
}
