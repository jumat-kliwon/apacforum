import { deleteEvent } from '~~/server/services/events'

/** Events with pending, paid or refunded transactions are refused, as with a single delete. */
export default defineEventHandler(event => bulkDelete(event, 'events.manage', deleteEvent))
