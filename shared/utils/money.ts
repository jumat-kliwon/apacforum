/**
 * Money in the currency an event sells its tickets in. Amounts are integers in minor units:
 * whole rupiah for IDR, cents for USD and SGD. DOKU only takes IDR, so foreign prices are
 * converted with `convertToIdr` when the invoice is issued.
 */
export const CURRENCIES = ['IDR', 'USD', 'SGD'] as const
export type Currency = typeof CURRENCIES[number]
/** Currencies that need an exchange rate to rupiah. */
export const FOREIGN_CURRENCIES = ['USD', 'SGD'] as const
export type ForeignCurrency = typeof FOREIGN_CURRENCIES[number]

const EXPONENT: Record<Currency, number> = { IDR: 0, USD: 2, SGD: 2 }
const SYMBOL: Record<Currency, string> = { IDR: 'Rp', USD: 'US$', SGD: 'S$' }
/** Decimal places of an exchange rate (`currency_rates.rate_idr` is numeric(18, 4)). */
export const RATE_SCALE = 4

export const currencyExponent = (cur: Currency) => EXPONENT[cur]
export const currencySymbol = (cur: Currency) => SYMBOL[cur]
export const isForeignCurrency = (cur: Currency): cur is ForeignCurrency => cur !== 'IDR'

/**
 * Major → minor units: `149.5` USD → `14950`. Parsed as text, so `0.29` gives `29` and not `28.999…`.
 * Null when negative, not a plain decimal, or more precise than the currency allows.
 */
export function toMinor(major: string | number, cur: Currency): number | null {
  const text = typeof major === 'number' ? (Number.isFinite(major) ? String(major) : '') : major.trim()
  const m = /^(\d+)(?:\.(\d*))?$/.exec(text)
  if (!m) return null
  const exp = EXPONENT[cur]
  const frac = m[2] ?? ''
  if (frac.replace(/0+$/, '').length > exp) return null
  const minor = Number(m[1] + frac.padEnd(exp, '0').slice(0, exp))
  return Number.isSafeInteger(minor) ? minor : null
}

/** Minor → major units: `14950` USD → `149.5`. */
export const toMajor = (minor: number, cur: Currency) => minor / 10 ** EXPONENT[cur]

/** An exchange rate as an integer in 1/10^RATE_SCALE rupiah, or null when it is not a positive decimal with at most 4 places. */
function parseRate(rate: string | number): bigint | null {
  const text = typeof rate === 'number' ? (Number.isFinite(rate) ? String(rate) : '') : rate.trim()
  const m = /^(\d+)(?:\.(\d*))?$/.exec(text)
  if (!m) return null
  const frac = m[2] ?? ''
  if (frac.replace(/0+$/, '').length > RATE_SCALE) return null
  const scaled = BigInt(m[1] + frac.padEnd(RATE_SCALE, '0').slice(0, RATE_SCALE))
  return scaled > 0n ? scaled : null
}

export const isValidRate = (rate: string | number) => parseRate(rate) !== null

/**
 * Minor units of `cur` → whole rupiah at `rateIdr` rupiah per unit, rounded up to the next rupiah.
 * Integer maths only: `14950` USD cents at `16250` → `2429375`.
 */
export function convertToIdr(minor: number, cur: Currency, rateIdr: string | number): number {
  if (cur === 'IDR') return minor
  const rate = parseRate(rateIdr)
  if (rate === null) throw new Error(`Invalid exchange rate: ${rateIdr}`)
  const den = 10n ** BigInt(EXPONENT[cur] + RATE_SCALE)
  const idr = (BigInt(minor) * rate + den - 1n) / den
  return Number(idr)
}

/** `Rp 2,500,000` · `US$ 149.50` · `S$ 200.00` */
export function formatMoney(minor: number, cur: Currency) {
  const exp = EXPONENT[cur]
  const amount = new Intl.NumberFormat('en-US', { minimumFractionDigits: exp, maximumFractionDigits: exp }).format(toMajor(minor, cur))
  return `${SYMBOL[cur]} ${amount}`
}

/** `1 USD = Rp 16,250` */
export const formatRate = (cur: ForeignCurrency, rateIdr: string | number) =>
  `1 ${cur} = Rp ${new Intl.NumberFormat('en-US', { maximumFractionDigits: RATE_SCALE }).format(Number(rateIdr))}`
