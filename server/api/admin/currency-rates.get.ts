import { db } from '~~/server/db'
import { currencyRates } from '~~/server/db/schema'

/** Current rates, read-only, for the event and ticket forms. Setting them needs `settings.manage`. */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'events.manage', 'settings.manage')
  return db.select({ currency: currencyRates.currency, rateIdr: currencyRates.rateIdr }).from(currencyRates)
})
