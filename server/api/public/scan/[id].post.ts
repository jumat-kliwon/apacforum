import * as z from 'zod'
import { checkInTicket } from '~~/server/services/checkin'

const schema = z.object({
  key: z.string(),
  code: z.string().trim().min(1, 'Scan or type a ticket code').max(64)
})

/** Ticket scanner: validates a ticket code for this event and checks the participant in. */
export default defineEventHandler(async (event) => {
  rateLimit(event, 'scan', { limit: 120, windowMs: 60_000 })
  const { key, code } = await parseBody(event, schema)
  const eventId = requireScannerKey(event, key)
  const { ticket, ...res } = await checkInTicket(code, eventId)
  // the desk only needs to recognise the person; contact details stay in the admin panel
  return { ...res, ticket: ticket && { name: ticket.name, organization: ticket.organization, ticketTypeName: ticket.ticketTypeName, ticketCode: ticket.ticketCode, checkedInAt: ticket.checkedInAt } }
})
