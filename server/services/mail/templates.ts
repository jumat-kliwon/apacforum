/**
 * Static email templates (the 9 templates from the "Participant email templates" design).
 * Each template returns structured content; `renderEmail` wraps it in one shared layout.
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
  'registration-verified',
  'payment-reminder',
  'payment-success',
  'invoice-expired',
  'refund-processed',
  'event-reminder-h3',
  'event-thank-you'
] as const
export type TemplateKey = typeof TEMPLATE_KEYS[number]

export const TEMPLATE_META: Record<TemplateKey, { group: 'Registration' | 'Payment' | 'Event', name: string, trigger: string, tone: Tone, registration: string, payment: string }> = {
  'registration-verified': { group: 'Registration', name: 'Registration + invoice', trigger: 'Participant submits the registration form (or an admin verifies a pending registration)', tone: 'success', registration: 'Verified', payment: 'Awaiting payment' },
  'payment-reminder': { group: 'Payment', name: 'Payment reminder', trigger: 'Within the last day before the payment deadline', tone: 'warning', registration: 'Verified', payment: 'Awaiting payment' },
  'payment-success': { group: 'Payment', name: 'Payment received + e-ticket', trigger: 'DOKU confirms the payment', tone: 'success', registration: 'Verified', payment: 'Paid' },
  'invoice-expired': { group: 'Payment', name: 'Invoice expired', trigger: 'Payment deadline passes', tone: 'danger', registration: 'Verified', payment: 'Expired' },
  'refund-processed': { group: 'Payment', name: 'Refund processed', trigger: 'Admin approves a cancellation', tone: 'neutral', registration: 'Cancelled', payment: 'Refunded' },
  'event-reminder-h3': { group: 'Event', name: '3-day event reminder', trigger: '3 days before the event (or as soon as payment arrives within those 3 days), paid participants', tone: 'info', registration: 'Verified', payment: 'Paid' },
  'event-thank-you': { group: 'Event', name: 'Thank you', trigger: '1 day after the event ends', tone: 'success', registration: 'Verified', payment: 'Paid' }
}

const eventDate = (d: MailData) => formatDateRange(d.event.startDate, d.event.endDate)
const eventUrl = (d: MailData) => `${d.siteUrl}/events/${d.event.slug}`
const wib = (date: Date) => `${formatDateTime(date)} WIB`

/** Google Calendar link for the "Add to calendar" button. */
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
  'registration-verified': d => ({
    subject: `Registration received — complete your payment${d.invoice?.expiresAt ? ` by ${formatDateTime(d.invoice.expiresAt)} WIB` : ''}`,
    preheader: `Invoice of ${formatRupiah(d.invoice?.total ?? 0)} for ${d.ticketTypeName}. Pay within 48 hours.`,
    tone: 'success',
    heading: 'Complete your payment',
    body: [`Thanks for registering for ${d.event.name}. Complete the payment before the deadline so your seat is not released to someone else.`],
    boxTitle: `Invoice ${d.invoice?.no ?? ''}`,
    rows: [
      ['Ticket type', d.ticketTypeName ?? '-'],
      ['Price', formatRupiah(d.ticketPrice ?? d.invoice?.total ?? 0)],
      ...(d.invoice?.expiresAt ? [['Payment deadline', wib(d.invoice.expiresAt)] as [string, string]] : []),
      ['Total', formatRupiah(d.invoice?.total ?? 0), true]
    ],
    cta: d.invoice?.paymentUrl ? { label: 'Pay now', url: d.invoice.paymentUrl } : undefined,
    note: 'You can pay by virtual account, QRIS, bank transfer, e-wallet or credit card.'
  }),

  'payment-reminder': d => ({
    subject: `Reminder: complete your ${d.event.name} payment`,
    preheader: `Invoice ${d.invoice?.no} expires${d.invoice?.expiresAt ? ` ${wib(d.invoice.expiresAt)}` : ' tomorrow'}.`,
    tone: 'warning',
    heading: 'We have not received your payment yet',
    body: [`Your invoice expires${d.invoice?.expiresAt ? ` on ${wib(d.invoice.expiresAt)}` : ' soon'}. After that we release your seat to someone else.`],
    boxTitle: `Invoice ${d.invoice?.no ?? ''}`,
    rows: [
      ['Ticket type', d.ticketTypeName ?? '-'],
      ...(d.invoice?.expiresAt ? [['Payment deadline', wib(d.invoice.expiresAt)] as [string, string]] : []),
      ['Total', formatRupiah(d.invoice?.total ?? 0), true]
    ],
    cta: d.invoice?.paymentUrl ? { label: 'Pay now', url: d.invoice.paymentUrl } : undefined,
    note: 'Already paid? You can ignore this email. Confirmation usually arrives within 10 minutes.'
  }),

  'payment-success': d => ({
    subject: `Payment received — here is your ${d.event.name} e-ticket`,
    preheader: 'Keep this email. The QR code is used to check in at the venue.',
    tone: 'success',
    heading: `See you in ${d.event.city}!`,
    body: [`We received your payment. Your seat at ${d.event.name} is confirmed.`],
    boxTitle: 'Payment receipt',
    rows: [
      ['Invoice no.', d.invoice?.no ?? '-'],
      ['Method', d.invoice?.methodLabel ?? '-'],
      ...(d.invoice?.paidAt ? [['Paid', wib(d.invoice.paidAt)] as [string, string]] : []),
      ['Total', formatRupiah(d.invoice?.total ?? 0), true]
    ],
    qr: d.ticketCode ? { code: d.ticketCode, caption: 'Show this QR code at the registration desk to collect your ID card.' } : undefined,
    cta: { label: 'Add to calendar', url: calendarUrl(d) }
  }),

  'invoice-expired': d => ({
    subject: `Your ${d.event.name} invoice has expired`,
    preheader: 'You can still register again while seats are available.',
    tone: 'danger',
    heading: 'Your invoice has expired',
    body: [
      `We did not receive your payment before the deadline, so invoice ${d.invoice?.no} has been cancelled.`,
      `If you still want to attend, you can register again.${d.remainingSeats != null ? ` ${d.remainingSeats} seats are left for your ticket type.` : ''}`
    ],
    cta: { label: 'Register again', url: `${eventUrl(d)}/register` },
    note: 'Paid but the invoice expired? Reply to this email with your proof of transfer.'
  }),

  'refund-processed': d => ({
    subject: `We are processing your ${d.event.name} refund`,
    preheader: `${formatRupiah(d.invoice?.refundAmount ?? d.invoice?.total ?? 0)} returns to your account within 7–14 working days.`,
    tone: 'neutral',
    heading: 'Your refund is being processed',
    body: ['We approved the cancellation of your registration. The money goes back to your original payment method.'],
    boxTitle: 'Refund details',
    rows: [
      ['Invoice no.', d.invoice?.no ?? '-'],
      ['Original method', d.invoice?.methodLabel ?? '-'],
      ['Expected arrival', '7–14 working days'],
      ['Refund amount', formatRupiah(d.invoice?.refundAmount ?? d.invoice?.total ?? 0), true]
    ],
    note: 'The e-ticket for this registration is no longer valid.'
  }),

  'event-reminder-h3': d => ({
    subject: `Coming up: what to know before ${d.event.name}`,
    preheader: 'Venue, dates and what to bring.',
    tone: 'info',
    heading: `${d.event.name} is almost here`,
    body: ['Here is what to prepare before you come.'],
    boxTitle: 'Event details',
    rows: [
      ['Dates', eventDate(d)],
      ['Venue', `${d.event.venueName}, ${d.event.city}`],
      ['Bring', 'Your e-ticket (QR) and an ID card']
    ],
    qr: d.ticketCode ? { code: d.ticketCode, caption: 'Show this QR code at the registration desk to collect your ID card.' } : undefined,
    cta: { label: 'See the full agenda', url: eventUrl(d) }
  }),

  'event-thank-you': d => ({
    subject: `Thank you for joining ${d.event.name}`,
    preheader: 'See you at the next APCR event.',
    tone: 'success',
    heading: 'Thank you for joining us',
    body: [`Thank you for being part of ${d.event.name} in ${d.event.city}. We will let you know about the next APCR event.`],
    cta: { label: 'View event page', url: eventUrl(d) }
  })
}

/** Core Design System colors; emails need literal values, not CSS variables. */
const TONE: Record<Tone, [bg: string, fg: string]> = {
  info: ['#eff6ff', '#1d4ed8'],
  success: ['#f0fdf4', '#15803d'],
  warning: ['#fffbeb', '#b45309'],
  danger: ['#fef2f2', '#b91c1c'],
  neutral: ['#f1f5f9', '#475569']
}

/** Plain-text glyphs: email clients do not load icon fonts or inline SVG reliably. */
const TONE_GLYPH: Record<Tone, string> = { info: 'i', success: '&#10003;', warning: '!', danger: '!', neutral: '&#8634;' }

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]!))

/**
 * Email HTML (table layout, inline styles). `qrSrc` is a `cid:` reference when sending and a data URI in previews.
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
        <img src="${qrSrc}" width="160" height="160" alt="E-ticket QR code ${esc(c.qr.code)}" style="display:block">
        <div style="margin-top:12px;font:600 14px/20px ${font};color:#0f172a">${esc(d.event.name)} e-ticket</div>
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
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(c.subject)}</title></head>
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
      <div style="width:40px;height:40px;border-radius:999px;background:${toneBg};color:${toneFg};text-align:center;font:700 20px/40px ${font}" aria-hidden="true">${TONE_GLYPH[c.tone]}</div>
      <h1 style="margin:16px 0 0;font:700 22px/30px ${font};color:#0f172a">${esc(c.heading)}</h1>
      <p style="margin:16px 0 0;font:400 15px/24px ${font};color:#334155">Hi ${esc(d.to.name)},</p>
      ${c.body.map(p => `<p style="margin:12px 0 0;font:400 15px/24px ${font};color:#334155">${esc(p)}</p>`).join('')}
      ${rows}${qr}${cta}
      ${c.note ? `<p style="margin:0 0 16px;font:400 13px/20px ${font};color:#64748b">${esc(c.note)}</p>` : ''}
      <p style="margin:16px 0 0;font:400 15px/24px ${font};color:#334155">Warm regards,<br>The ${esc(d.event.name)} team</p>
    </td></tr>
    <tr><td style="padding:20px 28px;border-top:1px solid #e2e8f0;font:400 12px/18px ${font};color:#64748b">
      ASEAN Public Communication &amp; Reputation Forum<br>
      Need help? Reply to this email.
    </td></tr>
  </table>
</td></tr></table>
</body></html>`

  const text = [
    `Hi ${d.to.name},`,
    '',
    ...c.body,
    '',
    ...(c.boxTitle ? [c.boxTitle] : []),
    ...(c.rows ?? []).map(([k, v]) => `${k}: ${v}`),
    ...(c.qr ? ['', `E-ticket: ${c.qr.code}`, c.qr.caption] : []),
    ...(c.cta ? ['', `${c.cta.label}: ${c.cta.url}`] : []),
    ...(c.note ? ['', c.note] : []),
    '',
    'Warm regards,',
    `The ${d.event.name} team`
  ].join('\n')

  return { html, text }
}
