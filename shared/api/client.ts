import { type MemoryItem, type MemoryType } from '../types'
import { type PaginatedResponse } from '../types/pagination'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false'
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000'
const PAGE_SIZE = 50

export type FetchMemoriesParams = {
  cursor?: string | null
  type?: MemoryType | null
  query?: string | null
  tags?: string[] | null
  dateFrom?: string | null
  dateTo?: string | null
  signal?: AbortSignal
}

// Mock data loaded lazily
let _mockData: MemoryItem[] | null = null
async function getMockData(): Promise<MemoryItem[]> {
  if (_mockData) return _mockData
  // Dynamic imports — Next.js will tree-shake these in production when USE_MOCK is false
  const [episodes, profiles, knowledge] = await Promise.all([
    import('../../hub/src/lib/mock/episodes.json').then(m => m.default),
    import('../../hub/src/lib/mock/profiles.json').then(m => m.default),
    import('../../hub/src/lib/mock/knowledge.json').then(m => m.default),
  ])
  _mockData = [...episodes, ...profiles, ...knowledge]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as MemoryItem[]
  return _mockData
}

async function fetchMock(params: FetchMemoriesParams): Promise<PaginatedResponse<MemoryItem>> {
  const allItems = await getMockData()
  let items = [...allItems]

  if (params.type) {
    items = items.filter((item) => item.type === params.type)
  }
  if (params.tags && params.tags.length > 0) {
    items = items.filter((item) => params.tags!.every((tag: string) => item.tags.includes(tag)))
  }
  if (params.query) {
    const q = params.query.toLowerCase()
    items = items.filter((item) => {
      if (item.type === 'episode') return item.title.toLowerCase().includes(q) || item.turns.some((t: { content: string }) => t.content.toLowerCase().includes(q))
      if (item.type === 'profile') return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
      return item.subject.toLowerCase().includes(q) || item.content.toLowerCase().includes(q)
    })
  }
  if (params.dateFrom) {
    const from = new Date(params.dateFrom).getTime()
    items = items.filter((item) => new Date(item.createdAt).getTime() >= from)
  }
  if (params.dateTo) {
    const to = new Date(params.dateTo).getTime()
    items = items.filter((item) => new Date(item.createdAt).getTime() <= to)
  }

  const startIndex = params.cursor ? parseInt(params.cursor, 10) : 0
  const page = items.slice(startIndex, startIndex + PAGE_SIZE)
  const nextCursor = startIndex + PAGE_SIZE < items.length ? String(startIndex + PAGE_SIZE) : null

  return { data: page, cursor: nextCursor, hasMore: nextCursor !== null, total: items.length }
}

export async function fetchMemories(params: FetchMemoriesParams = {}): Promise<PaginatedResponse<MemoryItem>> {
  if (USE_MOCK) return fetchMock(params)

  const url = new URL('/api/v1/memories', API_BASE)
  if (params.cursor) url.searchParams.set('cursor', params.cursor)
  if (params.type) url.searchParams.set('type', params.type)
  if (params.query) url.searchParams.set('q', params.query)
  if (params.tags?.length) url.searchParams.set('tags', params.tags.join(','))
  if (params.dateFrom) url.searchParams.set('date_from', params.dateFrom)
  if (params.dateTo) url.searchParams.set('date_to', params.dateTo)

  const res = await fetch(url.toString(), { signal: params.signal })
  return res.json() as Promise<PaginatedResponse<MemoryItem>>
}

export async function fetchMemoryById(id: string, signal?: AbortSignal): Promise<MemoryItem | null> {
  if (USE_MOCK) {
    const allItems = await getMockData()
    return allItems.find((item) => item.id === id) ?? null
  }

  const res = await fetch(new URL(`/api/v1/memories/${id}`, API_BASE).toString(), { signal })
  if (!res.ok) return null
  return res.json() as Promise<MemoryItem>
}
