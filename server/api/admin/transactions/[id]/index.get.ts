import { eq } from 'drizzle-orm'
import { db } from '~~/server/db'
import { events, participants, transactions, users } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  await requireSuperadmin(event)
  const id = parseId(event)
  const [row] = await db.select({
    trx: transactions,
    user: { id: users.id, name: users.name, email: users.email, phone: users.phone, organization: users.organization },
    regNo: participants.regNo,
    event: { id: events.id, name: events.name, startDate: events.startDate, endDate: events.endDate }
  }).from(transactions)
    .leftJoin(users, eq(users.id, transactions.userId))
    .leftJoin(participants, eq(participants.id, transactions.participantId))
    .leftJoin(events, eq(events.id, transactions.eventId))
    .where(eq(transactions.id, id))
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })
  const { raw: _raw, ...payment } = row.trx.payment
  return { ...row, trx: { ...row.trx, payment } }
})
