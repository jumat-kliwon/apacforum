import { and, eq, isNull } from 'drizzle-orm'
import { db } from '../db'
import { events, participants, ticketTypes, users } from '../db/schema'

type TicketRow = Pick<typeof participants.$inferSelect, 'status' | 'paymentStatus'>

/** Why a scanned ticket of this event may not enter (shown at the desk), or null when it is valid. */
export function checkInRejection(row: TicketRow): string | null {
  // TODO: decide which registrations are admitted at the door
  return null
}

/**
 * Scanner check-in: looks the ticket code up, validates it and stamps `checkedInAt` once.
 * The stamp is a conditional update, so two desks scanning the same ticket cannot both admit it.
 */
export async function checkInTicket(code: string, eventId: string) {
  const ticketCode = code.trim().toUpperCase()
  const [row] = await db.select({
    id: participants.id,
    userId: participants.userId,
    regNo: participants.regNo,
    ticketCode: participants.ticketCode,
    status: participants.status,
    paymentStatus: participants.paymentStatus,
    checkedInAt: participants.checkedInAt,
    eventId: events.id,
    eventName: events.name,
    ticketTypeName: ticketTypes.name,
    name: users.name,
    email: users.email,
    organization: users.organization
  }).from(participants)
    .innerJoin(events, eq(events.id, participants.eventId))
    .innerJoin(ticketTypes, eq(ticketTypes.id, participants.ticketTypeId))
    .innerJoin(users, eq(users.id, participants.userId))
    .where(eq(participants.ticketCode, ticketCode))

  if (!row) return { result: 'not_found' as const, code: ticketCode, ticket: null, message: 'No ticket has this code.' }
  // another event's ticket: say so without showing whose it is
  if (row.eventId !== eventId) return { result: 'invalid' as const, code: ticketCode, ticket: null, message: 'This ticket is for another event.' }

  const { id, ...ticket } = row
  const rejection = checkInRejection(row)
  if (rejection) return { result: 'invalid' as const, code: ticketCode, ticket: { id, ...ticket }, message: rejection }

  const [stamped] = await db.update(participants)
    .set({ checkedInAt: new Date() })
    .where(and(eq(participants.id, id), isNull(participants.checkedInAt)))
    .returning({ checkedInAt: participants.checkedInAt })

  return stamped
    ? { result: 'checked_in' as const, code: ticketCode, ticket: { id, ...ticket, checkedInAt: stamped.checkedInAt }, message: 'Checked in.' }
    : { result: 'already' as const, code: ticketCode, ticket: { id, ...ticket }, message: 'This ticket was already checked in.' }
}

/** Undo a check-in (wrong person scanned, or a test scan). */
export async function undoCheckIn(participantId: string) {
  const [row] = await db.update(participants).set({ checkedInAt: null }).where(eq(participants.id, participantId)).returning({ id: participants.id })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Registration not found' })
}
