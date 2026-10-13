/** All dates are shown in Western Indonesia Time (WIB), where the events take place. */
const TZ = 'Asia/Jakarta'
const LOCALE = 'en-GB'

/** `Rp 2,500,000` */
export const formatRupiah = (n: number) => `Rp ${new Intl.NumberFormat('en-US').format(n)}`

/** `1,248` */
export const formatNumber = (n: number) => new Intl.NumberFormat('en-US').format(n)

/** `Rp 4.19B` */
export function formatRupiahShort(n: number) {
  if (n >= 1e9) return `Rp ${(n / 1e9).toLocaleString('en-US', { maximumFractionDigits: 2 })}B`
  if (n >= 1e6) return `Rp ${(n / 1e6).toLocaleString('en-US', { maximumFractionDigits: 1 })}M`
  return formatRupiah(n)
}

const toDate = (d: Date | string) => (typeof d === 'string' ? new Date(d) : d)

/** `08:52` */
export const formatTime = (d: Date | string) =>
  new Intl.DateTimeFormat(LOCALE, { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(toDate(d))

/** `12 October 2026` */
export const formatDate = (d: Date | string, month: 'long' | 'short' = 'long') =>
  new Intl.DateTimeFormat(LOCALE, { timeZone: TZ, day: 'numeric', month, year: 'numeric' }).format(toDate(d))

/*
 * Combined formats are assembled by hand: ICU versions differ in their separators
 * (Bun prints "Wednesday, 2 December", Chromium "Wednesday 2 December"), which breaks SSR hydration.
 */

/** `12 Oct 2026, 08:52` */
export const formatDateTime = (d: Date | string) => `${formatDate(d, 'short')}, ${formatTime(d)}`

/** `Wednesday, 2 December 2026` */
export const formatDateWithDay = (d: Date | string) =>
  `${new Intl.DateTimeFormat(LOCALE, { timeZone: TZ, weekday: 'long' }).format(toDate(d))}, ${formatDate(d)}`

/** Calendar date `YYYY-MM-DD` without a time-zone shift. */
const fromIsoDate = (iso: string) => new Date(`${iso}T12:00:00+07:00`)

/** Event date range: `2–4 December 2026`, `6 November 2026`, `30 Nov – 2 Dec 2026`. */
export function formatDateRange(start: string, end: string, month: 'long' | 'short' = 'long') {
  const a = fromIsoDate(start)
  const b = fromIsoDate(end)
  if (start === end) return formatDate(a, month)
  const sameMonth = start.slice(0, 7) === end.slice(0, 7)
  const sameYear = start.slice(0, 4) === end.slice(0, 4)
  const day = (d: Date) => new Intl.DateTimeFormat(LOCALE, { timeZone: TZ, day: 'numeric' }).format(d)
  if (sameMonth) return `${day(a)}–${formatDate(b, month)}`
  const dm = (d: Date) => new Intl.DateTimeFormat(LOCALE, { timeZone: TZ, day: 'numeric', month }).format(d)
  return sameYear ? `${dm(a)} – ${formatDate(b, month)}` : `${formatDate(a, month)} – ${formatDate(b, month)}`
}

export const formatIsoDate = (iso: string, month: 'long' | 'short' = 'long') => formatDate(fromIsoDate(iso), month)
export const formatIsoDateWithDay = (iso: string) => formatDateWithDay(fromIsoDate(iso))

/** Avatar initials: `Dimas Saputra` → `DS`. */
export const initials = (name: string) =>
  name.replace(/^(dr|prof|ir)\.?\s+/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join('')
