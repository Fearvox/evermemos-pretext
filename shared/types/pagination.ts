import { z, type ZodType } from 'zod'

export function paginatedResponseSchema<T extends ZodType>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    cursor: z.string().nullable(),
    hasMore: z.boolean(),
    total: z.number().int().nonneg().optional(),
  })
}

export type PaginatedResponse<T> = {
  data: T[]
  cursor: string | null
  hasMore: boolean
  total?: number
}
