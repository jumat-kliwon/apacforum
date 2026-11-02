import { sortOrderSchema } from '~~/shared/schemas/event'
import { setSpeakerOrder } from '~~/server/services/speakers'

/** Sets the manual position of one row (the "Order" column). */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'events.manage')
  const id = parseId(event)
  const { sortOrder } = await parseBody(event, sortOrderSchema)
  return { id: await setSpeakerOrder(id, sortOrder) }
})
