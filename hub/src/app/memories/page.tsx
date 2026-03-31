import { Suspense } from 'react'
import { MemoriesPageClient } from '@/components/memory/MemoriesPageClient'

export default function MemoriesPage() {
  return (
    <Suspense>
      <MemoriesPageClient />
    </Suspense>
  )
}
