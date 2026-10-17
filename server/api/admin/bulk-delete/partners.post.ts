import { deletePartner } from '~~/server/services/partners'

export default defineEventHandler(event => bulkDelete(event, deletePartner))
