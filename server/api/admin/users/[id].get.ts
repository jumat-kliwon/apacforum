import { and, desc, eq } from 'drizzle-orm'
import QRCode from 'qrcode'
import { db } from '~~/server/db'
import { events, participants, ticketTypes, transactions, users } from '~~/server/db/schema'

/** Participant detail: profile, every event registration (with its e-ticket QR), transaction history. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(event)
  const [user] = await db.select({
    id: users.id, name: users.name, email: users.email, phone: users.phone, organization: users.organization,
    jobTitle: users.jobTitle, country: users.country, city: users.city, tshirtSize: users.tshirtSize,
    mealPreference: users.mealPreference, referralSource: users.referralSource, role: users.role, createdAt: users.createdAt
  }).from(users).where(and(eq(users.id, id), eq(users.role, 'participant')))
  if (!user) throw createError({ statusCode: 404, statusMessage: 'Participant not found' })

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
      ticketIssuedAt: participants.ticketIssuedAt,
      checkedInAt: participants.checkedInAt,
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

  // the same QR as the e-ticket email: it encodes the ticket code the scanner looks up
  const withQr = await Promise.all(registrations.map(async r => ({
    ...r,
    ticketQr: r.ticketCode ? await QRCode.toDataURL(r.ticketCode, { width: 320, margin: 1 }) : null
  })))

  return {
    user,
    registrations: withQr,
    transactions: trx.map(({ payment, ...t }) => ({ ...t, channel: payment.channel ?? null })),
    totalPaid: trx.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.total, 0)
  }
})
