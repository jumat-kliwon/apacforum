import { verifyParticipants } from '~~/server/services/registration'

export default defineEventHandler(async (event) => {
  const admin = await requirePermission(event, 'registrations.manage')
  const affected = await verifyParticipants([parseId(event)], { id: admin.id, name: admin.name })
  if (!affected) throw createError({ statusCode: 409, statusMessage: 'This registration was already processed' })
  return { affected }
})
