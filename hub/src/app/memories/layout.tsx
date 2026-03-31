import { MemoriesNav } from '@/components/memory/MemoriesNav'

export default function MemoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--surface-dominant)]">
      <MemoriesNav />
      <main className="mx-auto max-w-[720px] px-4 lg:px-8 pt-6">
        {children}
      </main>
    </div>
  )
}
