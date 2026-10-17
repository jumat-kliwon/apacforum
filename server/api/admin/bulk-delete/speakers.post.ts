import { deleteSpeaker } from '~~/server/services/speakers'

export default defineEventHandler(event => bulkDelete(event, deleteSpeaker))
