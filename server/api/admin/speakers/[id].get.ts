import { eq } from 'drizzle-orm'
import { db } from '~~/server/db'
import { agendaDays, events, speakers } from '~~/server/db/schema'
import { speakerSelect, withPhotoUrl } from '~~/server/services/speakers'

/** One speaker — the edit form. */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'events.manage')
  const id = parseId(event)
  const [row] = await db.select(speakerSelect).from(speakers)
    .innerJoin(events, eq(events.id, speakers.eventId))
    .leftJoin(agendaDays, eq(agendaDays.id, speakers.agendaDayId))
    .where(eq(speakers.id, id))
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Speaker not found' })
  return withPhotoUrl(row)
})
