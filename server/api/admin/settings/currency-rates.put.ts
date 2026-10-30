import { currencyRateFormSchema } from '~~/shared/schemas/settings'
import { setRate } from '~~/server/services/currency'

export default defineEventHandler(async (event) => {
  const admin = await requirePermission(event, 'settings.manage')
  const form = await parseBody(event, currencyRateFormSchema)
  await setRate(form.currency, form.rateIdr, admin)
  return { ok: true }
})
