import { and, eq, gt, inArray, isNull, lte, sql } from 'drizzle-orm'
import type { TransactionHistoryEntry } from '../../shared/schemas/transaction'
import { formatInvoiceNo, formatTicketCode } from '../../shared/utils/numbering'
import { db } from '../db'
import { jsonParam } from '../db/columns'
import { events, participants, ticketTypes, transactions, users } from '../db/schema'
import { loadMailData, siteUrl, type Tx } from './context'
import { createCheckout, mapChannel, type DokuNotification } from './doku'
import { sendTemplateSafe } from './mail/send'

export const PAYMENT_WINDOW_HOURS = 48

const now = () => new Date()
const entry = (type: TransactionHistoryEntry['type'], extra: Partial<TransactionHistoryEntry> = {}): TransactionHistoryEntry =>
  ({ type, at: now().toISOString(), actor: null, ...extra })

/** Tambah entri riwayat di SQL supaya tidak menimpa update lain yang berjalan bersamaan. */
const appendHistory = (...items: TransactionHistoryEntry[]) =>
  sql`${transactions.history} || ${jsonParam(items)}`

/**
 * Buat tagihan untuk peserta yang baru diverifikasi (dalam transaksi DB pemanggil).
 * Tiket gratis langsung dianggap lunas.
 */
export async function createInvoice(tx: Tx, participantId: string, actor: { id: string, name: string }) {
  const [row] = await tx.select({ p: participants, u: users, e: events, t: ticketTypes })
    .from(participants)
    .innerJoin(users, eq(users.id, participants.userId))
    .innerJoin(events, eq(events.id, participants.eventId))
    .innerJoin(ticketTypes, eq(ticketTypes.id, participants.ticketTypeId))
    .where(eq(participants.id, participantId))
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Peserta tidak ditemukan' })

  const [seq] = await tx.update(events)
    .set({ invoiceSeq: sql`${events.invoiceSeq} + 1` })
    .where(eq(events.id, row.e.id))
    .returning({ invoiceSeq: events.invoiceSeq })
  const issuedAt = now()
  const free = row.t.price === 0

  const [trx] = await tx.insert(transactions).values({
    invoiceNo: formatInvoiceNo(row.e.code, seq!.invoiceSeq, issuedAt),
    userId: row.u.id,
    participantId: row.p.id,
    eventId: row.e.id,
    participantName: row.u.name,
    participantEmail: row.u.email,
    eventName: row.e.name,
    ticketTypeName: row.t.name,
    status: free ? 'paid' : 'pending',
    total: row.t.price,
    expiresAt: free ? null : new Date(issuedAt.getTime() + PAYMENT_WINDOW_HOURS * 3600_000),
    paidAt: free ? issuedAt : null,
    items: {
      lines: [{ description: `Tiket ${row.t.name}`, note: row.e.name, qty: 1, unitPrice: row.t.price, subtotal: row.t.price }],
      subtotal: row.t.price,
      discount: 0
    },
    history: [entry('created', { description: `oleh ${actor.name} setelah verifikasi`, actor })]
  }).returning()

  await tx.update(participants).set({ paymentStatus: free ? 'paid' : 'pending' }).where(eq(participants.id, participantId))
  if (free) await issueTicket(tx, participantId)
  return trx!
}

/** Buat link DOKU Checkout untuk tagihan yang belum punya link. */
export async function ensureCheckout(transactionId: string) {
  const [row] = await db.select({ trx: transactions, u: users })
    .from(transactions)
    .leftJoin(users, eq(users.id, transactions.userId))
    .where(eq(transactions.id, transactionId))
  if (!row || row.trx.status !== 'pending') return row?.trx ?? null
  if (row.trx.payment.dokuPaymentUrl) return row.trx

  const dueMinutes = row.trx.expiresAt ? Math.max(5, Math.floor((row.trx.expiresAt.getTime() - Date.now()) / 60_000)) : PAYMENT_WINDOW_HOURS * 60
  const checkout = await createCheckout({
    invoiceNo: row.trx.invoiceNo,
    amount: row.trx.total,
    dueMinutes,
    callbackUrl: `${siteUrl()}/pembayaran/selesai`,
    customer: { name: row.trx.participantName, email: row.trx.participantEmail, phone: row.u?.phone },
    lineItems: row.trx.items.lines.filter(l => l.subtotal > 0).map(l => ({ name: l.description, price: l.unitPrice, quantity: l.qty }))
  })
  const [updated] = await db.update(transactions).set({
    payment: sql`${transactions.payment} || ${jsonParam({ dokuPaymentUrl: checkout.url, dokuRequestId: checkout.requestId })}`
  }).where(eq(transactions.id, transactionId)).returning()
  return updated!
}

/** Kode e-tiket dari counter tipe tiket. */
async function issueTicket(tx: Tx, participantId: string) {
  const [row] = await tx.select({ p: participants, e: events, t: ticketTypes })
    .from(participants)
    .innerJoin(events, eq(events.id, participants.eventId))
    .innerJoin(ticketTypes, eq(ticketTypes.id, participants.ticketTypeId))
    .where(eq(participants.id, participantId))
  if (!row || row.p.ticketCode) return row?.p.ticketCode ?? null
  const [seq] = await tx.update(ticketTypes)
    .set({ ticketSeq: sql`${ticketTypes.ticketSeq} + 1` })
    .where(eq(ticketTypes.id, row.t.id))
    .returning({ ticketSeq: ticketTypes.ticketSeq })
  const code = formatTicketCode(row.e.code, new Date(row.e.startDate), row.t.code, seq!.ticketSeq)
  await tx.update(participants).set({ ticketCode: code, ticketIssuedAt: now() }).where(eq(participants.id, participantId))
  return code
}

/** Notifikasi DOKU sukses → lunas + e-tiket. Idempoten. */
export async function markPaid(notification: DokuNotification) {
  const invoiceNo = notification.order?.invoice_number
  if (!invoiceNo) throw createError({ statusCode: 400, statusMessage: 'invoice_number kosong' })

  const result = await db.transaction(async (tx) => {
    const [trx] = await tx.select().from(transactions).where(eq(transactions.invoiceNo, invoiceNo)).for('update')
    if (!trx) throw createError({ statusCode: 404, statusMessage: 'Tagihan tidak ditemukan' })
    if (trx.status === 'paid' || trx.status === 'refunded') return { trx, changed: false, ticketCode: null }
    if (Number(notification.order?.amount) !== trx.total) {
      throw createError({ statusCode: 400, statusMessage: 'Jumlah pembayaran tidak sesuai tagihan' })
    }

    const { method, channel } = mapChannel(notification)
    const paidAt = notification.transaction?.date ? new Date(notification.transaction.date) : now()
    const [updated] = await tx.update(transactions).set({
      status: 'paid',
      method,
      paidAt: Number.isNaN(paidAt.getTime()) ? now() : paidAt,
      payment: sql`${transactions.payment} || ${jsonParam({
        ...(channel && { channel }),
        ...(notification.virtual_account_info?.virtual_account_number && { vaNumber: notification.virtual_account_info.virtual_account_number }),
        dokuReference: notification.transaction?.original_request_id,
        adminNote: 'Pembayaran otomatis terkonfirmasi oleh DOKU.',
        raw: notification
      })}`,
      history: appendHistory(entry('paid', { description: [method === 'virtual_account' ? 'VA' : null, channel].filter(Boolean).join(' ') || undefined }))
    }).where(eq(transactions.id, trx.id)).returning()

    let ticketCode: string | null = null
    if (trx.participantId) {
      await tx.update(participants).set({ paymentStatus: 'paid' }).where(eq(participants.id, trx.participantId))
      ticketCode = await issueTicket(tx, trx.participantId)
      if (ticketCode) {
        await tx.update(transactions).set({ history: appendHistory(entry('ticket_sent', { description: ticketCode })) })
          .where(eq(transactions.id, trx.id))
      }
    }
    return { trx: updated!, changed: true, ticketCode }
  })

  if (result.changed && result.trx.participantId) {
    const data = await loadMailData(result.trx.participantId)
    if (data) await sendTemplateSafe('payment-success', data)
  }
  return result
}

/** Tagihan yang lewat batas → kedaluwarsa. */
export async function expireDue() {
  const expired = await db.transaction(async (tx) => {
    const rows = await tx.update(transactions)
      .set({ status: 'expired', history: appendHistory(entry('expired')) })
      .where(and(eq(transactions.status, 'pending'), lte(transactions.expiresAt, now())))
      .returning({ id: transactions.id, participantId: transactions.participantId })
    const ids = rows.map(r => r.participantId).filter((id): id is string => !!id)
    if (ids.length) {
      await tx.update(participants).set({ paymentStatus: 'expired' })
        .where(and(inArray(participants.id, ids), eq(participants.paymentStatus, 'pending')))
    }
    return rows
  })
  for (const r of expired) {
    if (!r.participantId) continue
    const data = await loadMailData(r.participantId)
    if (data) await sendTemplateSafe('invoice-expired', { ...data, remainingSeats: await remainingSeats(r.participantId) })
  }
  return expired.length
}

async function remainingSeats(participantId: string) {
  const [row] = await db.select({ quota: ticketTypes.quota, ticketTypeId: ticketTypes.id })
    .from(participants).innerJoin(ticketTypes, eq(ticketTypes.id, participants.ticketTypeId))
    .where(eq(participants.id, participantId))
  if (!row) return null
  return Math.max(0, row.quota - await activeCount(db, row.ticketTypeId))
}

/** Pendaftaran yang memakan kuota: semua kecuali ditolak/dibatalkan/kedaluwarsa. */
export async function activeCount(d: typeof db | Tx, ticketTypeId: string) {
  const [r] = await d.select({ n: sql<number>`count(*)::int` }).from(participants).where(and(
    eq(participants.ticketTypeId, ticketTypeId),
    sql`${participants.status} not in ('rejected', 'cancelled')`,
    sql`${participants.paymentStatus} not in ('expired', 'refunded')`
  ))
  return r?.n ?? 0
}

/** Pengingat 24 jam sebelum batas bayar, sekali per tagihan. */
export async function remindDue() {
  const rows = await db.update(transactions)
    .set({ payment: sql`${transactions.payment} || ${jsonParam({ reminderSentAt: now().toISOString() })}` })
    .where(and(
      eq(transactions.status, 'pending'),
      gt(transactions.expiresAt, now()),
      lte(transactions.expiresAt, new Date(Date.now() + 24 * 3600_000)),
      isNull(sql`${transactions.payment}->>'reminderSentAt'`)
    ))
    .returning({ id: transactions.id, participantId: transactions.participantId })
  for (const r of rows) {
    if (!r.participantId) continue
    await ensureCheckout(r.id).catch(() => null)
    const data = await loadMailData(r.participantId)
    if (data) await sendTemplateSafe('payment-reminder', data)
  }
  return rows.length
}

/** Refund oleh admin: tagihan → refund, pendaftaran → dibatalkan, e-tiket tidak berlaku. */
export async function refund(transactionId: string, actor: { id: string, name: string }, note?: string) {
  const trx = await db.transaction(async (tx) => {
    const [t] = await tx.select().from(transactions).where(eq(transactions.id, transactionId)).for('update')
    if (!t) throw createError({ statusCode: 404, statusMessage: 'Transaksi tidak ditemukan' })
    if (t.status !== 'paid') throw createError({ statusCode: 409, statusMessage: 'Hanya transaksi lunas yang bisa direfund' })
    const at = now().toISOString()
    const [updated] = await tx.update(transactions).set({
      status: 'refunded',
      payment: sql`${transactions.payment} || ${jsonParam({ refundAmount: t.total, refundedAt: at, ...(note && { adminNote: note }) })}`,
      history: appendHistory(entry('refunded', { actor, description: note }))
    }).where(eq(transactions.id, t.id)).returning()
    if (t.participantId) {
      await tx.update(participants)
        .set({ status: 'cancelled', paymentStatus: 'refunded', cancelledAt: now() })
        .where(eq(participants.id, t.participantId))
    }
    return updated!
  })
  if (trx.participantId) {
    const data = await loadMailData(trx.participantId)
    if (data) await sendTemplateSafe('refund-processed', data)
  }
  return trx
}

/** Catat pengiriman email tagihan di riwayat. */
export async function logInvoiceSent(transactionId: string) {
  await db.update(transactions).set({ history: appendHistory(entry('invoice_sent')) }).where(eq(transactions.id, transactionId))
}
