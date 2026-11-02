import * as z from 'zod'
import { listForReorder, parseReorderKind } from '~~/server/services/reorder'

/** Every row of the event, in the current order — the Reorder page of Speakers, Partners or Tickets. */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'events.manage')
  const kind = parseReorderKind(event)
  const { eventId } = parseQuery(event, z.object({ eventId: z.uuid() }))
  return listForReorder(kind, eventId)
})
