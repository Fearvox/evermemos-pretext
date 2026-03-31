import { MemoryDetailLoader } from '@/components/memory/MemoryDetailLoader'

export default async function MemoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <MemoryDetailLoader id={id} />
}
