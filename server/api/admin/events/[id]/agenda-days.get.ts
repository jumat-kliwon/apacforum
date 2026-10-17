import { asc, eq } from 'drizzle-orm'
import { db } from '~~/server/db'
import { agendaDays } from '~~/server/db/schema'

/** The event's agenda days: the Session choices of the speaker form. */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'events.manage')
  const id = parseId(event)
  return db.select({ id: agendaDays.id, sortOrder: agendaDays.sortOrder, label: agendaDays.label, date: agendaDays.date })
    .from(agendaDays)
    .where(eq(agendaDays.eventId, id))
    .orderBy(asc(agendaDays.sortOrder))
})
