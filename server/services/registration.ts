import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import type { z } from 'zod'
import type { registrationSchema } from '../../shared/schemas/participant'
import { formatRegNo } from '../../shared/utils/numbering'
import { db } from '../db'
import { events, participants, ticketTypes, transactions, users } from '../db/schema'
import { loadMailData } from './context'
import { sendTemplateSafe } from './mail/send'
import { activeCount, createInvoice, ensureCheckout, logInvoiceSent } from './payment'

type Actor = { id: string, name: string }
type RegistrationData = z.output<typeof registrationSchema>

/** Batas pendaftaran = akhir hari tanggal itu di WIB. */
export const deadlineFromDate = (isoDate: string) => new Date(`${isoDate}T23:59:59+07:00`)

/**
 * Form Registration publik: buat/temukan user `participant`, lalu satu baris `participants`.
 */
export async function registerParticipant(slug: string, input: RegistrationData) {
  const participantId = await db.transaction(async (tx) => {
    const [event] = await tx.select().from(events).where(eq(events.slug, slug))
    if (!event || event.status !== 'published') throw createError({ statusCode: 404, statusMessage: 'Event tidak ditemukan' })
    if (!event.registrationOpen || event.registrationDeadline < new Date()) {
      throw createError({ statusCode: 409, statusMessage: 'Pendaftaran untuk event ini sudah ditutup' })
    }

    // kunci baris tipe tiket supaya cek kuota tidak balapan
    const [ticket] = await tx.select().from(ticketTypes)
      .where(and(eq(ticketTypes.id, input.ticketTypeId), eq(ticketTypes.eventId, event.id)))
      .for('update')
    if (!ticket || !ticket.isOnSale) throw createError({ statusCode: 422, statusMessage: 'Tipe peserta tidak tersedia' })
    if (await activeCount(tx, ticket.id) >= ticket.quota) {
      throw createError({ statusCode: 409, statusMessage: `Kuota ${ticket.name} sudah penuh` })
    }

    const profile = {
      phone: input.phone,
      organization: input.organization,
      jobTitle: input.jobTitle,
      country: input.country,
      city: input.city,
      tshirtSize: input.tshirtSize,
      mealPreference: input.mealPreference,
      referralSource: input.referralSource
    }
    const [existing] = await tx.select().from(users).where(eq(users.email, input.email)).for('update')
    let userId: string
    if (!existing) {
      const [u] = await tx.insert(users).values({ name: input.name, email: input.email, role: 'participant', ...profile }).returning({ id: users.id })
      userId = u!.id
    } else {
      userId = existing.id
      // Form publik tidak terautentikasi: hanya mengisi field yang masih kosong,
      // supaya orang lain tidak bisa menimpa profil seseorang hanya dengan tahu emailnya.
      if (existing.role === 'participant') {
        const fill = Object.fromEntries(
          Object.entries(profile).filter(([k, v]) => v != null && existing[k as keyof typeof profile] == null)
        )
        if (Object.keys(fill).length) await tx.update(users).set(fill).where(eq(users.id, userId))
      }
    }

    const [active] = await tx.select({ id: participants.id }).from(participants).where(and(
      eq(participants.eventId, event.id),
      eq(participants.userId, userId),
      sql`${participants.status} not in ('rejected', 'cancelled')`
    ))
    if (active) throw createError({ statusCode: 409, statusMessage: 'Email ini sudah terdaftar di event ini' })

    const [seq] = await tx.update(events)
      .set({ registrationSeq: sql`${events.registrationSeq} + 1` })
      .where(eq(events.id, event.id))
      .returning({ registrationSeq: events.registrationSeq })
    const [p] = await tx.insert(participants).values({
      regNo: formatRegNo(event.code, seq!.registrationSeq, new Date()),
      userId,
      eventId: event.id,
      ticketTypeId: ticket.id
    }).returning({ id: participants.id })
    return p!.id
  })

  const data = await loadMailData(participantId)
  if (data) await sendTemplateSafe('registration-received', data)
  return { participantId, regNo: data?.regNo }
}

/** Verifikasi → tagihan + link DOKU + email. Mengembalikan jumlah yang diverifikasi. */
export async function verifyParticipants(ids: string[], actor: Actor) {
  const created = await db.transaction(async (tx) => {
    const rows = await tx.update(participants)
      .set({ status: 'verified', verifiedAt: new Date(), verifiedBy: actor.id })
      .where(and(inArray(participants.id, ids), eq(participants.status, 'pending_verification')))
      .returning({ id: participants.id })
    const out: { participantId: string, transactionId: string, free: boolean }[] = []
    for (const r of rows) {
      const trx = await createInvoice(tx, r.id, actor)
      out.push({ participantId: r.id, transactionId: trx.id, free: trx.status === 'paid' })
    }
    return out
  })

  for (const c of created) {
    if (!c.free) {
      await ensureCheckout(c.transactionId).catch(err => console.error('[doku] gagal membuat checkout', err))
    }
    const data = await loadMailData(c.participantId)
    if (!data) continue
    await sendTemplateSafe(c.free ? 'payment-success' : 'registration-verified', data)
    if (!c.free) await logInvoiceSent(c.transactionId)
  }
  return created.length
}

export async function rejectParticipant(id: string, reason: string, actor: Actor) {
  const [row] = await db.update(participants)
    .set({ status: 'rejected', rejectionReason: reason, rejectedAt: new Date(), verifiedBy: actor.id })
    .where(and(eq(participants.id, id), eq(participants.status, 'pending_verification')))
    .returning({ id: participants.id })
  if (!row) throw createError({ statusCode: 409, statusMessage: 'Hanya pendaftaran yang menunggu verifikasi yang bisa ditolak' })
  const data = await loadMailData(id)
  if (data) await sendTemplateSafe('registration-rejected', data)
}

/**
 * "Kirim email" dari CMS: kirim ulang email yang sesuai status pendaftaran sekarang.
 * Mengembalikan template yang dikirim.
 */
export async function resendStatusEmail(id: string) {
  const [p] = await db.select().from(participants).where(eq(participants.id, id))
  if (!p) throw createError({ statusCode: 404, statusMessage: 'Peserta tidak ditemukan' })

  if (p.status === 'verified' && p.paymentStatus === 'pending') {
    const [trx] = await db.select({ id: transactions.id }).from(transactions)
      .where(eq(transactions.participantId, id)).orderBy(desc(transactions.createdAt)).limit(1)
    if (trx) await ensureCheckout(trx.id)
  }
  const data = await loadMailData(id)
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Peserta tidak ditemukan' })

  const key = p.status === 'pending_verification'
    ? 'registration-received'
    : p.status === 'rejected'
      ? 'registration-rejected'
      : p.paymentStatus === 'paid'
        ? 'payment-success'
        : p.paymentStatus === 'pending'
          ? 'registration-verified'
          : p.paymentStatus === 'expired'
            ? 'invoice-expired'
            : 'refund-processed'
  await sendTemplateSafe(key, data)
  return key
}
