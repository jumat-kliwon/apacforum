import nodemailer, { type Transporter } from 'nodemailer'
import QRCode from 'qrcode'
import { renderEmail, templates, type MailData, type TemplateKey } from './templates'

/**
 * Sends through SMTP: either `SMTP_HOST` (+ `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`)
 * or a single `SMTP_URL`. Without either, emails are only logged, so the flows can still be tried
 * in development.
 */
let transport: Transporter | null = null

function getTransport() {
  const env = process.env
  if (env.SMTP_HOST) {
    const port = Number(env.SMTP_PORT || 465)
    transport ??= nodemailer.createTransport({
      host: env.SMTP_HOST,
      port,
      secure: env.SMTP_SECURE ? env.SMTP_SECURE === 'true' : port === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined
    })
  } else if (env.SMTP_URL) {
    transport ??= nodemailer.createTransport(env.SMTP_URL)
  }
  return transport
}

export async function sendTemplate(key: TemplateKey, data: MailData) {
  const content = templates[key](data)
  const qrPng = content.qr ? await QRCode.toBuffer(content.qr.code, { width: 320, margin: 1 }) : null
  const { html, text } = renderEmail(content, data, qrPng ? 'cid:eticket-qr' : undefined)

  const t = getTransport()
  if (!t) {
    console.info(`[mail] (not sent, SMTP is not configured) ${key} → ${data.to.email}: ${content.subject}`)
    return { sent: false as const }
  }
  await t.sendMail({
    from: process.env.MAIL_FROM ?? 'APCR <no-reply@apcrforum.com>',
    to: { name: data.to.name, address: data.to.email },
    subject: content.subject,
    html,
    text,
    attachments: qrPng ? [{ filename: 'e-ticket.png', content: qrPng, cid: 'eticket-qr' }] : []
  })
  return { sent: true as const }
}

/**
 * Sends without failing the main flow (the status change is already saved).
 * `failed` is true when SMTP refused the email, so scheduled jobs can try again on their next run.
 */
export async function sendTemplateSafe(key: TemplateKey, data: MailData) {
  try {
    return { ...await sendTemplate(key, data), failed: false }
  } catch (err) {
    console.error(`[mail] could not send ${key} to ${data.to.email}`, err)
    return { sent: false as const, failed: true }
  }
}

/** Preview HTML (QR code as a data URI). */
export async function previewTemplate(key: TemplateKey, data: MailData) {
  const content = templates[key](data)
  const qr = content.qr ? await QRCode.toDataURL(content.qr.code, { width: 320, margin: 1 }) : undefined
  return { content, ...renderEmail(content, data, qr) }
}
