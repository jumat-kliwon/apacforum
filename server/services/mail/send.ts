import nodemailer, { type Transporter } from 'nodemailer'
import QRCode from 'qrcode'
import { renderEmail, templates, type MailData, type TemplateKey } from './templates'

/**
 * Sends through SMTP (`SMTP_URL`, `MAIL_FROM`). Without `SMTP_URL` emails are only logged,
 * so the flows can still be tried in development.
 */
let transport: Transporter | null = null

function getTransport() {
  if (!process.env.SMTP_URL) return null
  transport ??= nodemailer.createTransport(process.env.SMTP_URL)
  return transport
}

export async function sendTemplate(key: TemplateKey, data: MailData) {
  const content = templates[key](data)
  const qrPng = content.qr ? await QRCode.toBuffer(content.qr.code, { width: 320, margin: 1 }) : null
  const { html, text } = renderEmail(content, data, qrPng ? 'cid:eticket-qr' : undefined)

  const t = getTransport()
  if (!t) {
    console.info(`[mail] (not sent, SMTP_URL is empty) ${key} → ${data.to.email}: ${content.subject}`)
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

/** Sends without failing the main flow (the status change is already saved). */
export async function sendTemplateSafe(key: TemplateKey, data: MailData) {
  try {
    return await sendTemplate(key, data)
  } catch (err) {
    console.error(`[mail] could not send ${key} to ${data.to.email}`, err)
    return { sent: false as const }
  }
}

/** Preview HTML (QR code as a data URI). */
export async function previewTemplate(key: TemplateKey, data: MailData) {
  const content = templates[key](data)
  const qr = content.qr ? await QRCode.toDataURL(content.qr.code, { width: 320, margin: 1 }) : undefined
  return { content, ...renderEmail(content, data, qr) }
}
