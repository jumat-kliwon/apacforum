import { and, desc, eq } from 'drizzle-orm'
import { db } from '~~/server/db'
import { events, participants, ticketTypes, transactions, users } from '~~/server/db/schema'

/** Detail peserta: profil, semua pendaftaran event, riwayat transaksi. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(event)
  const [user] = await db.select({
    id: users.id, name: users.name, email: users.email, phone: users.phone, organization: users.organization,
    jobTitle: users.jobTitle, country: users.country, city: users.city, tshirtSize: users.tshirtSize,
    mealPreference: users.mealPreference, referralSource: users.referralSource, role: users.role, createdAt: users.createdAt
  }).from(users).where(and(eq(users.id, id), eq(users.role, 'participant')))
  if (!user) throw createError({ statusCode: 404, statusMessage: 'Peserta tidak ditemukan' })

  const [registrations, trx] = await Promise.all([
    db.select({
      id: participants.id,
      regNo: participants.regNo,
      eventId: events.id,
      eventName: events.name,
      startDate: events.startDate,
      endDate: events.endDate,
      ticketTypeName: ticketTypes.name,
      status: participants.status,
      paymentStatus: participants.paymentStatus,
      ticketCode: participants.ticketCode,
      rejectionReason: participants.rejectionReason,
      createdAt: participants.createdAt
    }).from(participants)
      .innerJoin(events, eq(events.id, participants.eventId))
      .innerJoin(ticketTypes, eq(ticketTypes.id, participants.ticketTypeId))
      .where(eq(participants.userId, id))
      .orderBy(desc(participants.createdAt)),
    db.select({
      id: transactions.id, invoiceNo: transactions.invoiceNo, eventName: transactions.eventName, total: transactions.total,
      method: transactions.method, payment: transactions.payment, status: transactions.status, createdAt: transactions.createdAt
    }).from(transactions).where(eq(transactions.userId, id)).orderBy(desc(transactions.createdAt))
  ])

  return {
    user,
    registrations,
    transactions: trx.map(({ payment, ...t }) => ({ ...t, channel: payment.channel ?? null })),
    totalPaid: trx.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.total, 0)
  }
})
