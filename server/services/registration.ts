import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import type { z } from 'zod'
import type { registrationSchema } from '../../shared/schemas/participant'
import { earlyBirdEnded } from '../../shared/utils/earlyBird'
import { formatRegNo } from '../../shared/utils/numbering'
import { db } from '../db'
import { events, participants, ticketTypes, transactions, users } from '../db/schema'
import { loadMailData } from './context'
import { sendTemplateSafe } from './mail/send'
import { activeCount, createInvoice, ensureCheckout, logInvoiceSent } from './payment'

type Actor = { id: string, name: string }
type RegistrationData = z.output<typeof registrationSchema>

/** Registration deadline = end of that day in WIB. */
export const deadlineFromDate = (isoDate: string) => new Date(`${isoDate}T23:59:59+07:00`)

/**
 * Public registration form: find or create the `participant` user, add one `participants` row and
 * invoice it straight away (no admin verification). Returns the DOKU link the registrant is sent to;
 * `paymentUrl` is null for free tickets, or when DOKU could not be reached (the invoice email and the
 * payment reminder retry the link). `notify` sends the email; run it after the response.
 */
export async function registerParticipant(slug: string, input: RegistrationData) {
  const { participantId, regNo, transactionId, invoiceNo, free } = await db.transaction(async (tx) => {
    const [event] = await tx.select().from(events).where(eq(events.slug, slug))
    if (!event || event.status !== 'published') throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    if (!event.registrationOpen || event.registrationDeadline < new Date()) {
      throw createError({ statusCode: 409, statusMessage: 'Registration for this event is closed' })
    }

    // lock the ticket type row so concurrent quota checks cannot race
    const [ticket] = await tx.select().from(ticketTypes)
      .where(and(eq(ticketTypes.id, input.ticketTypeId), eq(ticketTypes.eventId, event.id)))
      .for('update')
    if (!ticket || !ticket.isOnSale) throw createError({ statusCode: 422, statusMessage: 'This participant type is not available' })
    if (earlyBirdEnded(ticket)) throw createError({ statusCode: 409, statusMessage: `The early-bird period for ${ticket.name} has ended` })
    if (await activeCount(tx, ticket.id) >= ticket.quota) {
      throw createError({ statusCode: 409, statusMessage: `${ticket.name} is sold out` })
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
      // The public form is unauthenticated: only fill fields that are still empty,
      // so nobody can overwrite someone's profile just by knowing their email.
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
    if (active) throw createError({ statusCode: 409, statusMessage: 'This email is already registered for this event' })

    const [seq] = await tx.update(events)
      .set({ registrationSeq: sql`${events.registrationSeq} + 1` })
      .where(eq(events.id, event.id))
      .returning({ registrationSeq: events.registrationSeq })
    const regNo = formatRegNo(event.code, seq!.registrationSeq, new Date())
    const [p] = await tx.insert(participants).values({
      regNo,
      userId,
      eventId: event.id,
      ticketTypeId: ticket.id,
      status: 'verified',
      verifiedAt: new Date()
    }).returning({ id: participants.id })
    const trx = await createInvoice(tx, p!.id, null)
    return { participantId: p!.id, regNo, transactionId: trx.id, invoiceNo: trx.invoiceNo, free: trx.status === 'paid' }
  })

  let paymentUrl: string | null = null
  if (!free) {
    const trx = await ensureCheckout(transactionId).catch((err) => {
      console.error('[doku] could not create checkout', err)
      return null
    })
    paymentUrl = trx?.payment.dokuPaymentUrl ?? null
  }

  async function notify() {
    // DOKU failed during the request: try again so the invoice email carries the DOKU link
    if (!free && !paymentUrl) {
      await ensureCheckout(transactionId).catch(err => console.error('[doku] could not create checkout for the invoice email', err))
    }
    const data = await loadMailData(participantId)
    if (!data) return
    await sendTemplateSafe(free ? 'payment-success' : 'registration-verified', data)
    if (!free) await logInvoiceSent(transactionId)
  }
  return { participantId, regNo, invoiceNo, paymentUrl, free, notify }
}

/** Verify → invoice + DOKU link + email. Returns how many were verified. */
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
      await ensureCheckout(c.transactionId).catch(err => console.error('[doku] could not create checkout', err))
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
  if (!row) throw createError({ statusCode: 409, statusMessage: 'Only registrations pending verification can be rejected' })
}

/**
 * "Send email" in the CMS: resends the email that matches the registration's current status.
 * Returns the template that was sent.
 */
export async function resendStatusEmail(id: string) {
  const [p] = await db.select().from(participants).where(eq(participants.id, id))
  if (!p) throw createError({ statusCode: 404, statusMessage: 'Participant not found' })
  if (p.status === 'pending_verification' || p.status === 'rejected') {
    throw createError({ statusCode: 409, statusMessage: 'There is no email for registrations that are pending verification or rejected' })
  }

  if (p.status === 'verified' && p.paymentStatus === 'pending') {
    const [trx] = await db.select({ id: transactions.id }).from(transactions)
      .where(eq(transactions.participantId, id)).orderBy(desc(transactions.createdAt)).limit(1)
    if (trx) await ensureCheckout(trx.id)
  }
  const data = await loadMailData(id)
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Participant not found' })

  const key = p.paymentStatus === 'paid'
    ? 'payment-success'
    : p.paymentStatus === 'pending'
      ? 'registration-verified'
      : p.paymentStatus === 'expired'
        ? 'invoice-expired'
        : 'refund-processed'
  await sendTemplateSafe(key, data)
  return key
}
