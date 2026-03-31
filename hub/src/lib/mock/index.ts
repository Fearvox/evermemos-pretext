import type { Episode, Profile, KnowledgeEntry, MemoryItem } from '@shared/types'
import episodesData from './episodes.json'
import profilesData from './profiles.json'
import knowledgeData from './knowledge.json'

export const mockEpisodes: Episode[] = episodesData as Episode[]
export const mockProfiles: Profile[] = profilesData as Profile[]
export const mockKnowledge: KnowledgeEntry[] = knowledgeData as KnowledgeEntry[]

export const mockAllMemories: MemoryItem[] = [
  ...mockEpisodes,
  ...mockProfiles,
  ...mockKnowledge,
].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
