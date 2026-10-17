import type { H3Event } from 'h3'
import { bulkIdsSchema } from '~~/shared/schemas/bulk'

export interface BulkDeleteResult {
  affected: number
  /** Rows the single-row delete refused, with its reason (e.g. an event that still has paid transactions). */
  failed: { id: string, message: string }[]
}

/**
 * Bulk delete for an admin table: runs the resource's own single-row delete for every ticked id,
 * so each row keeps the same rules and file cleanup. One refused row does not stop the others.
 */
export async function bulkDelete(event: H3Event, remove: (id: string) => Promise<unknown>): Promise<BulkDeleteResult> {
  await requireAdmin(event)
  const { ids } = await parseBody(event, bulkIdsSchema)
  const result: BulkDeleteResult = { affected: 0, failed: [] }
  for (const id of ids) {
    try {
      await remove(id)
      result.affected++
    } catch (err) {
      result.failed.push({ id, message: (err as { statusMessage?: string }).statusMessage ?? 'Could not be deleted' })
    }
  }
  return result
}
