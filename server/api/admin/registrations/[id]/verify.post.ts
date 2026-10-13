import { verifyParticipants } from '~~/server/services/registration'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const affected = await verifyParticipants([parseId(event)], { id: admin.id, name: admin.name })
  if (!affected) throw createError({ statusCode: 409, statusMessage: 'This registration was already processed' })
  return { affected }
})
