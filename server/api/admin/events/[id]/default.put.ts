import * as z from 'zod'
import { setDefaultEvent } from '~~/server/services/events'

const schema = z.object({ isDefault: z.boolean() })

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'events.manage')
  const id = parseId(event)
  const { isDefault } = await parseBody(event, schema)
  await setDefaultEvent(id, isDefault)
  return { id, isDefault }
})
