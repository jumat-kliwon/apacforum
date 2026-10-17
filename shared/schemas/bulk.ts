import * as z from 'zod'

/** Rows ticked in an admin table, for a bulk action. */
export const bulkIdsSchema = z.object({
  ids: z.array(z.uuid()).min(1).max(500)
})
