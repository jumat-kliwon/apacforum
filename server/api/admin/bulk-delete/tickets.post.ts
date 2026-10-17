import { deleteTicketType } from '~~/server/services/events'

/** Ticket types in use, or the last one of a published event, are refused, as with a single delete. */
export default defineEventHandler(event => bulkDelete(event, deleteTicketType))
