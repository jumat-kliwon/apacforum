import * as z from 'zod'
import { FOREIGN_CURRENCIES, isValidRate } from '../utils/money'

/** One exchange rate on the Currency rates page: rupiah per 1 unit, up to 4 decimals. */
export const currencyRateFormSchema = z.object({
  currency: z.enum(FOREIGN_CURRENCIES),
  rateIdr: z.union([z.string(), z.number()])
    .transform(v => String(v).trim())
    .refine(isValidRate, 'Enter a rate above 0 with at most 4 decimals, e.g. 16250')
})

export type CurrencyRateForm = z.output<typeof currencyRateFormSchema>
