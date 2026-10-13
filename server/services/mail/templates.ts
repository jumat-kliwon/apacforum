/**
 * Template email statis (9 template dari desain "Template email peserta").
 * Setiap template menghasilkan konten terstruktur; `renderEmail` membungkusnya dengan layout yang sama.
 */
import { formatDateRange, formatDateTime, formatRupiah } from '../../../shared/utils/format'

export type MailData = {
  to: { name: string, email: string }
  event: { name: string, slug: string, startDate: string, endDate: string, city: string, venueName: string }
  siteUrl: string
  regNo?: string
  organization?: string | null
  ticketTypeName?: string
  ticketPrice?: number
  invoice?: {
    no: string
    total: number
    expiresAt?: Date | null
    paymentUrl?: string | null
    methodLabel?: string | null
    paidAt?: Date | null
    refundAmount?: number | null
  }
  ticketCode?: string | null
  rejectionReason?: string | null
  remainingSeats?: number | null
}

export type Tone = 'info' | 'success' | 'warning' | 'danger' | 'neutral'

export type EmailContent = {
  subject: string
  preheader: string
  tone: Tone
  heading: string
  body: string[]
  boxTitle?: string
  rows?: [label: string, value: string, strong?: boolean][]
  qr?: { code: string, caption: string }
  cta?: { label: string, url: string }
  note?: string
}

export const TEMPLATE_KEYS = [
  'registration-received',
  'registration-verified',
  'registration-rejected',
  'payment-reminder',
  'payment-success',
  'invoice-expired',
  'refund-processed',
  'event-reminder-h3',
  'event-thank-you'
] as const
export type TemplateKey = typeof TEMPLATE_KEYS[number]

export const TEMPLATE_META: Record<TemplateKey, { group: 'Pendaftaran' | 'Pembayaran' | 'Acara', name: string, trigger: string, tone: Tone, registration: string, payment: string }> = {
  'registration-received': { group: 'Pendaftaran', name: 'Pendaftaran diterima', trigger: 'Peserta mengirim form Registration', tone: 'info', registration: 'Menunggu verifikasi', payment: 'Belum ditagih' },
  'registration-verified': { group: 'Pendaftaran', name: 'Terverifikasi + tagihan', trigger: 'Admin memverifikasi pendaftaran', tone: 'success', registration: 'Terverifikasi', payment: 'Menunggu pembayaran' },
  'registration-rejected': { group: 'Pendaftaran', name: 'Pendaftaran ditolak', trigger: 'Admin menolak pendaftaran', tone: 'danger', registration: 'Ditolak', payment: 'Tidak ditagih' },
  'payment-reminder': { group: 'Pembayaran', name: 'Pengingat pembayaran', trigger: '24 jam sebelum batas pembayaran', tone: 'warning', registration: 'Terverifikasi', payment: 'Menunggu pembayaran' },
  'payment-success': { group: 'Pembayaran', name: 'Pembayaran berhasil + e-tiket', trigger: 'DOKU mengonfirmasi pembayaran', tone: 'success', registration: 'Terverifikasi', payment: 'Lunas' },
  'invoice-expired': { group: 'Pembayaran', name: 'Tagihan kedaluwarsa', trigger: 'Batas pembayaran terlewati', tone: 'danger', registration: 'Terverifikasi', payment: 'Kedaluwarsa' },
  'refund-processed': { group: 'Pembayaran', name: 'Refund diproses', trigger: 'Admin menyetujui pembatalan', tone: 'neutral', registration: 'Dibatalkan', payment: 'Refund' },
  'event-reminder-h3': { group: 'Acara', name: 'Pengingat H-3 acara', trigger: '3 hari sebelum acara, peserta lunas', tone: 'info', registration: 'Terverifikasi', payment: 'Lunas' },
  'event-thank-you': { group: 'Acara', name: 'Terima kasih', trigger: '1 hari setelah acara selesai', tone: 'success', registration: 'Terverifikasi', payment: 'Lunas' }
}

const eventDate = (d: MailData) => formatDateRange(d.event.startDate, d.event.endDate)
const eventUrl = (d: MailData) => `${d.siteUrl}/events/${d.event.slug}`
const wib = (date: Date) => `${formatDateTime(date)} WIB`

/** Link Google Calendar untuk CTA "Tambahkan ke kalender". */
function calendarUrl(d: MailData) {
  const day = (iso: string, add = 0) => {
    const dt = new Date(`${iso}T00:00:00Z`)
    dt.setUTCDate(dt.getUTCDate() + add)
    return dt.toISOString().slice(0, 10).replace(/-/g, '')
  }
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: d.event.name,
    dates: `${day(d.event.startDate)}/${day(d.event.endDate, 1)}`,
    location: `${d.event.venueName}, ${d.event.city}`,
    details: eventUrl(d)
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

export const templates: Record<TemplateKey, (d: MailData) => EmailContent> = {
  'registration-received': d => ({
    subject: `Pendaftaran ${d.event.name} kamu sudah kami terima`,
    preheader: 'Tim kami sedang memverifikasi data kamu, maksimal 2 hari kerja.',
    tone: 'info',
    heading: 'Terima kasih sudah mendaftar',
    body: [
      `Pendaftaran kamu untuk ${d.event.name} sudah kami terima. Tim kami akan memverifikasi data kamu dalam 2 hari kerja.`,
      'Setelah terverifikasi, kami mengirim tagihan dan link pembayaran ke email ini.'
    ],
    boxTitle: 'Ringkasan pendaftaran',
    rows: [
      ['No. pendaftaran', d.regNo ?? '-'],
      ['Nama', d.to.name],
      ['Instansi', d.organization ?? '-'],
      ['Tipe peserta', d.ticketTypeName ?? '-'],
      ['Acara', `${d.event.name} · ${eventDate(d)}`]
    ],
    cta: { label: 'Lihat halaman acara', url: eventUrl(d) },
    note: 'Ada data yang salah? Balas email ini sebelum pendaftaran diverifikasi.'
  }),

  'registration-verified': d => ({
    subject: `Pendaftaran terverifikasi — selesaikan pembayaran${d.invoice?.expiresAt ? ` sebelum ${formatDateTime(d.invoice.expiresAt)} WIB` : ''}`,
    preheader: `Tagihan ${formatRupiah(d.invoice?.total ?? 0)} untuk ${d.ticketTypeName}. Bayar dalam 48 jam.`,
    tone: 'success',
    heading: 'Pendaftaran kamu terverifikasi',
    body: ['Data kamu sudah kami verifikasi. Selesaikan pembayaran sebelum batas waktu supaya kursi kamu tidak dilepas ke peserta lain.'],
    boxTitle: `Tagihan ${d.invoice?.no ?? ''}`,
    rows: [
      ['Tipe tiket', d.ticketTypeName ?? '-'],
      ['Harga', formatRupiah(d.ticketPrice ?? d.invoice?.total ?? 0)],
      ...(d.invoice?.expiresAt ? [['Batas pembayaran', wib(d.invoice.expiresAt)] as [string, string]] : []),
      ['Total', formatRupiah(d.invoice?.total ?? 0), true]
    ],
    cta: d.invoice?.paymentUrl ? { label: 'Bayar sekarang', url: d.invoice.paymentUrl } : undefined,
    note: 'Bisa bayar lewat Virtual Account, QRIS, transfer bank, atau kartu kredit.'
  }),

  'registration-rejected': d => ({
    subject: `Kabar tentang pendaftaran ${d.event.name} kamu`,
    preheader: 'Pendaftaran kamu belum bisa kami terima. Ini alasannya dan langkah berikutnya.',
    tone: 'danger',
    heading: 'Pendaftaran kamu belum bisa kami terima',
    body: [
      `Mohon maaf, pendaftaran kamu sebagai ${d.ticketTypeName} belum bisa kami terima.`,
      ...(d.rejectionReason ? [`Alasan: ${d.rejectionReason}`] : []),
      'Kamu bisa mendaftar ulang dengan melengkapi data tersebut selama kuota masih tersedia.'
    ],
    cta: { label: 'Daftar ulang', url: `${eventUrl(d)}/register` },
    note: 'Tidak ada tagihan yang dibuat untuk pendaftaran ini.'
  }),

  'payment-reminder': d => ({
    subject: `Tinggal 24 jam: selesaikan pembayaran ${d.event.name}`,
    preheader: `Tagihan ${d.invoice?.no} kedaluwarsa${d.invoice?.expiresAt ? ` ${wib(d.invoice.expiresAt)}` : ' besok'}.`,
    tone: 'warning',
    heading: 'Pembayaran kamu belum kami terima',
    body: ['Tagihan kamu akan kedaluwarsa dalam 24 jam. Setelah itu kursi kamu kami lepas ke peserta lain.'],
    boxTitle: `Tagihan ${d.invoice?.no ?? ''}`,
    rows: [
      ['Tipe tiket', d.ticketTypeName ?? '-'],
      ...(d.invoice?.expiresAt ? [['Batas pembayaran', wib(d.invoice.expiresAt)] as [string, string]] : []),
      ['Total', formatRupiah(d.invoice?.total ?? 0), true]
    ],
    cta: d.invoice?.paymentUrl ? { label: 'Bayar sekarang', url: d.invoice.paymentUrl } : undefined,
    note: 'Sudah bayar? Abaikan email ini. Konfirmasi biasanya masuk dalam 10 menit.'
  }),

  'payment-success': d => ({
    subject: `Pembayaran berhasil — ini e-tiket ${d.event.name} kamu`,
    preheader: 'Simpan email ini. QR code dipakai untuk registrasi ulang di lokasi.',
    tone: 'success',
    heading: `Sampai jumpa di ${d.event.city}!`,
    body: [`Pembayaran kamu sudah kami terima. Kursi kamu di ${d.event.name} sudah aman.`],
    boxTitle: 'Bukti pembayaran',
    rows: [
      ['No. invoice', d.invoice?.no ?? '-'],
      ['Metode', d.invoice?.methodLabel ?? '-'],
      ...(d.invoice?.paidAt ? [['Dibayar', wib(d.invoice.paidAt)] as [string, string]] : []),
      ['Total', formatRupiah(d.invoice?.total ?? 0), true]
    ],
    qr: d.ticketCode ? { code: d.ticketCode, caption: 'Tunjukkan QR ini di meja registrasi untuk mengambil ID card.' } : undefined,
    cta: { label: 'Tambahkan ke kalender', url: calendarUrl(d) }
  }),

  'invoice-expired': d => ({
    subject: `Tagihan ${d.event.name} kamu sudah kedaluwarsa`,
    preheader: 'Kamu masih bisa mendaftar lagi selama kuota tersedia.',
    tone: 'danger',
    heading: 'Tagihan kamu sudah kedaluwarsa',
    body: [
      `Kami belum menerima pembayaran sampai batas waktu, jadi tagihan ${d.invoice?.no} kami batalkan.`,
      `Kalau masih ingin ikut, kamu bisa mendaftar lagi.${d.remainingSeats != null ? ` Kuota tiket saat ini tersisa ${d.remainingSeats} kursi.` : ''}`
    ],
    cta: { label: 'Daftar lagi', url: `${eventUrl(d)}/register` },
    note: 'Sudah transfer tapi tagihan kedaluwarsa? Balas email ini dengan bukti transfer.'
  }),

  'refund-processed': d => ({
    subject: `Refund ${d.event.name} sedang kami proses`,
    preheader: `Dana ${formatRupiah(d.invoice?.refundAmount ?? d.invoice?.total ?? 0)} kembali ke rekening kamu dalam 7–14 hari kerja.`,
    tone: 'neutral',
    heading: 'Refund kamu sedang diproses',
    body: ['Pembatalan pendaftaran kamu sudah kami setujui. Dana akan dikembalikan ke metode pembayaran awal.'],
    boxTitle: 'Detail refund',
    rows: [
      ['No. invoice', d.invoice?.no ?? '-'],
      ['Metode awal', d.invoice?.methodLabel ?? '-'],
      ['Estimasi masuk', '7–14 hari kerja'],
      ['Jumlah refund', formatRupiah(d.invoice?.refundAmount ?? d.invoice?.total ?? 0), true]
    ],
    note: 'E-tiket untuk pendaftaran ini sudah tidak berlaku.'
  }),

  'event-reminder-h3': d => ({
    subject: `3 hari lagi: info penting sebelum ${d.event.name}`,
    preheader: 'Lokasi, jadwal, dan yang perlu dibawa.',
    tone: 'info',
    heading: `${d.event.name} tinggal 3 hari lagi`,
    body: ['Ini info yang perlu kamu siapkan sebelum datang.'],
    boxTitle: 'Info acara',
    rows: [
      ['Tanggal', eventDate(d)],
      ['Lokasi', `${d.event.venueName}, ${d.event.city}`],
      ['Bawa', 'E-tiket (QR) dan kartu identitas']
    ],
    qr: d.ticketCode ? { code: d.ticketCode, caption: 'Tunjukkan QR ini di meja registrasi untuk mengambil ID card.' } : undefined,
    cta: { label: 'Lihat agenda lengkap', url: eventUrl(d) }
  }),

  'event-thank-you': d => ({
    subject: `Terima kasih sudah hadir di ${d.event.name}`,
    preheader: `Sampai jumpa di acara APCR berikutnya.`,
    tone: 'success',
    heading: 'Terima kasih sudah hadir',
    body: [`Terima kasih sudah menjadi bagian dari ${d.event.name} di ${d.event.city}. Kami akan mengabari kamu untuk acara APCR berikutnya.`],
    cta: { label: 'Lihat halaman acara', url: eventUrl(d) }
  })
}

const TONE: Record<Tone, [bg: string, fg: string]> = {
  info: ['#eff6ff', '#1d4ed8'],
  success: ['#f0fdf4', '#15803d'],
  warning: ['#fffbeb', '#b45309'],
  danger: ['#fef2f2', '#b91c1c'],
  neutral: ['#f1f5f9', '#475569']
}

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]!))

/**
 * HTML email (table layout, inline style). `qrSrc` = `cid:...` saat dikirim, data URI saat pratinjau.
 */
export function renderEmail(c: EmailContent, d: MailData, qrSrc?: string) {
  const [toneBg, toneFg] = TONE[c.tone]
  const font = `'Rethink Sans',-apple-system,'Segoe UI',Arial,sans-serif`
  const rows = c.rows?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #e2e8f0;border-radius:12px;border-collapse:separate">
        ${c.boxTitle ? `<tr><td colspan="2" style="padding:14px 16px 4px;font:600 14px/20px ${font};color:#0f172a">${esc(c.boxTitle)}</td></tr>` : ''}
        ${c.rows.map(([k, v, strong]) => `<tr>
          <td style="padding:8px 16px;font:400 14px/20px ${font};color:#64748b">${esc(k)}</td>
          <td style="padding:8px 16px;font:${strong ? 700 : 500} 14px/20px ${font};color:#0f172a;text-align:right">${esc(v)}</td>
        </tr>`).join('')}
      </table>`
    : ''
  const qr = c.qr && qrSrc
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;background:#f8fafc;border-radius:12px"><tr><td align="center" style="padding:20px">
        <img src="${qrSrc}" width="160" height="160" alt="QR code e-tiket ${esc(c.qr.code)}" style="display:block">
        <div style="margin-top:12px;font:600 14px/20px ${font};color:#0f172a">E-tiket ${esc(d.event.name)}</div>
        <div style="font:500 14px/20px 'JetBrains Mono',Menlo,monospace;color:#0f172a">${esc(c.qr.code)}</div>
        <div style="margin-top:4px;font:400 13px/18px ${font};color:#64748b">${esc(c.qr.caption)}</div>
      </td></tr></table>`
    : ''
  const cta = c.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 20px"><tr><td style="border-radius:8px;background:#ecbd56">
        <a href="${esc(c.cta.url)}" style="display:inline-block;padding:12px 20px;font:600 15px/20px ${font};color:#111216;text-decoration:none">${esc(c.cta.label)}</a>
      </td></tr></table>`
    : ''

  const html = `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(c.subject)}</title></head>
<body style="margin:0;padding:0;background:#f8fafc">
<div style="display:none;max-height:0;overflow:hidden">${esc(c.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc"><tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px">
    <tr><td style="padding:20px 28px;border-bottom:1px solid #e2e8f0">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="width:36px;height:36px;border-radius:8px;background:#ecbd56;text-align:center;font:800 16px/36px ${font};color:#111216">A</td>
        <td style="padding-left:12px">
          <div style="font:700 15px/20px ${font};color:#0f172a">${esc(d.event.name)}</div>
          <div style="font:400 13px/18px ${font};color:#64748b">${esc(eventDate(d))} · ${esc(d.event.city)}</div>
        </td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:28px">
      <div style="display:inline-block;padding:4px 10px;border-radius:999px;background:${toneBg};color:${toneFg};font:600 12px/16px ${font}">${esc(c.heading)}</div>
      <h1 style="margin:16px 0 0;font:700 22px/30px ${font};color:#0f172a">${esc(c.heading)}</h1>
      <p style="margin:16px 0 0;font:400 15px/24px ${font};color:#334155">Halo ${esc(d.to.name)},</p>
      ${c.body.map(p => `<p style="margin:12px 0 0;font:400 15px/24px ${font};color:#334155">${esc(p)}</p>`).join('')}
      ${rows}${qr}${cta}
      ${c.note ? `<p style="margin:0 0 16px;font:400 13px/20px ${font};color:#64748b">${esc(c.note)}</p>` : ''}
      <p style="margin:16px 0 0;font:400 15px/24px ${font};color:#334155">Salam hangat,<br>Panitia ${esc(d.event.name)}</p>
    </td></tr>
    <tr><td style="padding:20px 28px;border-top:1px solid #e2e8f0;font:400 12px/18px ${font};color:#64748b">
      ASEAN Public Communication &amp; Reputation Forum<br>
      Butuh bantuan? Balas email ini.
    </td></tr>
  </table>
</td></tr></table>
</body></html>`

  const text = [
    `Halo ${d.to.name},`,
    '',
    ...c.body,
    '',
    ...(c.boxTitle ? [c.boxTitle] : []),
    ...(c.rows ?? []).map(([k, v]) => `${k}: ${v}`),
    ...(c.qr ? ['', `E-tiket: ${c.qr.code}`, c.qr.caption] : []),
    ...(c.cta ? ['', `${c.cta.label}: ${c.cta.url}`] : []),
    ...(c.note ? ['', c.note] : []),
    '',
    'Salam hangat,',
    `Panitia ${d.event.name}`
  ].join('\n')

  return { html, text }
}
