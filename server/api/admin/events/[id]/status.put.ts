import * as z from 'zod'
import { setEventStatus } from '~~/server/services/events'

const schema = z.object({ status: z.enum(['draft', 'published']) })

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'events.manage')
  const id = parseId(event)
  const { status } = await parseBody(event, schema)
  await setEventStatus(id, status)
  return { id, status }
})
