'use client'

import { Button } from '@/components/ui/button'
import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react'

type DensityToggleProps = {
  isCompact: boolean
  onToggle: () => void
}

export function DensityToggle({ isCompact, onToggle }: DensityToggleProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="h-8 w-8 border-[var(--border)] bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      onClick={onToggle}
      aria-label={isCompact ? 'Show more' : 'Show less'}
      title={isCompact ? 'Expanded view' : 'Compact view'}
    >
      {isCompact ? (
        <ChevronsUpDown className="h-4 w-4" />
      ) : (
        <ChevronsDownUp className="h-4 w-4" />
      )}
    </Button>
  )
}
