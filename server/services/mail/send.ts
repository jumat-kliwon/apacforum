import nodemailer, { type Transporter } from 'nodemailer'
import QRCode from 'qrcode'
import { renderEmail, templates, type MailData, type TemplateKey } from './templates'

/**
 * Pengiriman lewat SMTP (`SMTP_URL`, `MAIL_FROM`). Tanpa `SMTP_URL`, email hanya dicatat di log
 * supaya alur tetap bisa dicoba di development.
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
    console.info(`[mail] (tidak dikirim, SMTP_URL kosong) ${key} → ${data.to.email}: ${content.subject}`)
    return { sent: false as const }
  }
  await t.sendMail({
    from: process.env.MAIL_FROM ?? 'APCR <no-reply@apcrforum.com>',
    to: { name: data.to.name, address: data.to.email },
    subject: content.subject,
    html,
    text,
    attachments: qrPng ? [{ filename: 'e-tiket.png', content: qrPng, cid: 'eticket-qr' }] : []
  })
  return { sent: true as const }
}

/** Kirim tanpa menggagalkan alur utama (status di DB sudah tersimpan). */
export async function sendTemplateSafe(key: TemplateKey, data: MailData) {
  try {
    return await sendTemplate(key, data)
  } catch (err) {
    console.error(`[mail] gagal mengirim ${key} ke ${data.to.email}`, err)
    return { sent: false as const }
  }
}

/** Pratinjau HTML (QR sebagai data URI). */
export async function previewTemplate(key: TemplateKey, data: MailData) {
  const content = templates[key](data)
  const qr = content.qr ? await QRCode.toDataURL(content.qr.code, { width: 320, margin: 1 }) : undefined
  return { content, ...renderEmail(content, data, qr) }
}
