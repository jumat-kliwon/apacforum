import { TEMPLATE_KEYS, TEMPLATE_META } from '~~/server/services/mail/templates'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return TEMPLATE_KEYS.map(key => ({ key, ...TEMPLATE_META[key] }))
})
