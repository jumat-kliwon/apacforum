import { eq } from 'drizzle-orm'
import { db } from '~~/server/db'
import { events, ticketTypes } from '~~/server/db/schema'
import { ticketTypeSelect } from '~~/server/services/events'

/** One ticket type with its sales — the edit form. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(event)
  const [row] = await db.select(ticketTypeSelect).from(ticketTypes)
    .innerJoin(events, eq(events.id, ticketTypes.eventId))
    .where(eq(ticketTypes.id, id))
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Ticket type not found' })
  return row
})
