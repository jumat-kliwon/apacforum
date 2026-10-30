import { desc, eq } from 'drizzle-orm'
import { db } from '../db'
import { events, participants, ticketTypes, transactions, users } from '../db/schema'
import type { MailData } from './mail/templates'
import { PAYMENT_METHOD } from '../../shared/utils/labels'

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]
export type Db = typeof db | Tx

export const siteUrl = () =>
  (useRuntimeConfig().public.siteUrl || process.env.BETTER_AUTH_URL
    || (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
    || 'http://localhost:3000').replace(/\/$/, '')

export const methodLabel = (method: keyof typeof PAYMENT_METHOD | null, channel?: string) =>
  method ? `${method === 'virtual_account' && channel ? 'VA' : PAYMENT_METHOD[method]}${channel ? ` ${channel}` : ''}` : null

/** Everything the email templates need for one registration. */
export async function loadMailData(participantId: string, d: Db = db): Promise<MailData | null> {
  const [row] = await d.select({ p: participants, u: users, e: events, t: ticketTypes })
    .from(participants)
    .innerJoin(users, eq(users.id, participants.userId))
    .innerJoin(events, eq(events.id, participants.eventId))
    .innerJoin(ticketTypes, eq(ticketTypes.id, participants.ticketTypeId))
    .where(eq(participants.id, participantId))
  if (!row) return null
  const [trx] = await d.select().from(transactions)
    .where(eq(transactions.participantId, participantId))
    .orderBy(desc(transactions.createdAt)).limit(1)

  return {
    to: { name: row.u.name, email: row.u.email },
    event: { name: row.e.name, slug: row.e.slug, startDate: row.e.startDate, endDate: row.e.endDate, city: row.e.city, venueName: row.e.venueName },
    siteUrl: siteUrl(),
    regNo: row.p.regNo,
    organization: row.u.organization,
    ticketTypeName: row.t.name,
    ticketPrice: row.t.price,
    currency: row.e.currency,
    ticketCode: row.p.ticketCode,
    invoice: trx
      ? {
          no: trx.invoiceNo,
          total: trx.total,
          expiresAt: trx.expiresAt,
          paymentUrl: trx.payment.dokuPaymentUrl ?? null,
          methodLabel: methodLabel(trx.method, trx.payment.channel),
          paidAt: trx.paidAt,
          refundAmount: trx.payment.refundAmount ?? null,
          fx: trx.items.fx ?? null
        }
      : undefined
  }
}
