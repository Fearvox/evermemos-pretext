import { z } from 'zod'

export const MemoryTypeSchema = z.enum(['episode', 'profile', 'knowledge'])
export type MemoryType = z.infer<typeof MemoryTypeSchema>

export const ConversationTurnSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'agent']),
  content: z.string(),
  timestamp: z.string().datetime(),
})
export type ConversationTurn = z.infer<typeof ConversationTurnSchema>

export const EpisodeSchema = z.object({
  id: z.string(),
  type: z.literal('episode'),
  title: z.string(),
  turns: z.array(ConversationTurnSchema),
  tags: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Episode = z.infer<typeof EpisodeSchema>

export const ProfileFieldSchema = z.object({
  label: z.string(),
  value: z.string(),
})
export type ProfileField = z.infer<typeof ProfileFieldSchema>

export const ProfileSchema = z.object({
  id: z.string(),
  type: z.literal('profile'),
  name: z.string(),
  role: z.string(),
  description: z.string(),
  fields: z.array(ProfileFieldSchema),
  tags: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Profile = z.infer<typeof ProfileSchema>

export const KnowledgeEntrySchema = z.object({
  id: z.string(),
  type: z.literal('knowledge'),
  subject: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type KnowledgeEntry = z.infer<typeof KnowledgeEntrySchema>

export const MemoryItemSchema = z.discriminatedUnion('type', [
  EpisodeSchema,
  ProfileSchema,
  KnowledgeEntrySchema,
])
export type MemoryItem = z.infer<typeof MemoryItemSchema>
