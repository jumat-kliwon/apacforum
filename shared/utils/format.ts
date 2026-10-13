const TZ = 'Asia/Jakarta'

/** `Rp 2.500.000` */
export const formatRupiah = (n: number) => `Rp ${new Intl.NumberFormat('id-ID').format(n)}`

/** `1.248` */
export const formatNumber = (n: number) => new Intl.NumberFormat('id-ID').format(n)

/** `Rp 4,19 M` */
export function formatRupiahShort(n: number) {
  if (n >= 1e9) return `Rp ${(n / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 2 })} M`
  if (n >= 1e6) return `Rp ${(n / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
  return formatRupiah(n)
}

const toDate = (d: Date | string) => (typeof d === 'string' ? new Date(d) : d)

/** `12 Okt 2026, 08.52` (WIB) */
export const formatDateTime = (d: Date | string) =>
  new Intl.DateTimeFormat('id-ID', { timeZone: TZ, day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    .format(toDate(d)).replace(' pukul', ',')

/** `12 Oktober 2026` */
export const formatDate = (d: Date | string, month: 'long' | 'short' = 'long') =>
  new Intl.DateTimeFormat('id-ID', { timeZone: TZ, day: 'numeric', month, year: 'numeric' }).format(toDate(d))

/** `Rabu, 2 Desember 2026` */
export const formatDateWithDay = (d: Date | string) =>
  new Intl.DateTimeFormat('id-ID', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(toDate(d))

/** Tanggal kalender `YYYY-MM-DD` tanpa geser zona waktu. */
const fromIsoDate = (iso: string) => new Date(`${iso}T12:00:00+07:00`)

/** Rentang tanggal event: `2–4 Desember 2026`, `6 November 2026`, `30 Nov – 2 Des 2026`. */
export function formatDateRange(start: string, end: string, month: 'long' | 'short' = 'long') {
  const a = fromIsoDate(start)
  const b = fromIsoDate(end)
  if (start === end) return formatDate(a, month)
  const sameMonth = start.slice(0, 7) === end.slice(0, 7)
  const sameYear = start.slice(0, 4) === end.slice(0, 4)
  const day = (d: Date) => new Intl.DateTimeFormat('id-ID', { timeZone: TZ, day: 'numeric' }).format(d)
  if (sameMonth) return `${day(a)}–${formatDate(b, month)}`
  const dm = (d: Date) => new Intl.DateTimeFormat('id-ID', { timeZone: TZ, day: 'numeric', month }).format(d)
  return sameYear ? `${dm(a)} – ${formatDate(b, month)}` : `${formatDate(a, month)} – ${formatDate(b, month)}`
}

export const formatIsoDate = (iso: string, month: 'long' | 'short' = 'long') => formatDate(fromIsoDate(iso), month)
export const formatIsoDateWithDay = (iso: string) => formatDateWithDay(fromIsoDate(iso))

/** Inisial untuk avatar: `Dimas Saputra` → `DS`. */
export const initials = (name: string) =>
  name.replace(/^(dr|prof|ir)\.?\s+/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join('')
