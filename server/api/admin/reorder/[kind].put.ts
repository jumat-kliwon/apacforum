import { reorderSchema } from '~~/shared/schemas/event'
import { parseReorderKind, saveOrder } from '~~/server/services/reorder'

/** Saves the order chosen on a Reorder page: the first id becomes 0, the next 1, and so on. */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'events.manage')
  const kind = parseReorderKind(event)
  const { eventId, ids } = await parseBody(event, reorderSchema)
  await saveOrder(kind, eventId, ids)
  return { ok: true }
})
