import { previewTemplate } from '~~/server/services/mail/send'
import { TEMPLATE_KEYS, TEMPLATE_META, type MailData, type TemplateKey } from '~~/server/services/mail/templates'
import { siteUrl } from '~~/server/services/context'

/** Sample data from the design, for previews. `usd` shows an event priced in USD and charged in rupiah. */
function sample(usd: boolean): MailData {
  const created = new Date('2026-10-11T08:20:00Z')
  return {
    to: { name: 'Dimas Saputra', email: 'dimas.saputra@pemkomedan.go.id' },
    event: { name: 'APCR 2026', slug: 'apcr-2026', startDate: '2026-12-02', endDate: '2026-12-04', city: 'Medan', venueName: 'Santika Premiere Dyandra' },
    siteUrl: siteUrl(),
    regNo: 'REG-APCR-26-01248',
    organization: 'Medan City Government',
    ticketTypeName: 'Indonesia Delegate',
    ticketPrice: usd ? 14_950 : 2_500_000,
    currency: usd ? 'USD' : 'IDR',
    ticketCode: 'APCR26-ID-0712',
    remainingSeats: 88,
    invoice: {
      no: 'INV-APCR-26-01248',
      total: usd ? 2_429_375 : 2_500_000,
      expiresAt: new Date(created.getTime() + 48 * 3600_000),
      paymentUrl: `${siteUrl()}/payment/finish`,
      methodLabel: 'VA BCA',
      paidAt: new Date('2026-10-12T02:04:00Z'),
      refundAmount: usd ? 2_429_375 : 2_500_000,
      fx: usd ? { currency: 'USD', unitPrice: 14_950, total: 14_950, rateIdr: '16250.0000', rateAt: created.toISOString() } : null
    }
  }
}

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'email_templates.view')
  const key = getRouterParam(event, 'key') as TemplateKey
  if (!TEMPLATE_KEYS.includes(key)) throw createError({ statusCode: 404, statusMessage: 'Template not found' })
  const { content, html } = await previewTemplate(key, sample(getQuery(event).currency === 'USD'))
  return { key, ...TEMPLATE_META[key], subject: content.subject, preheader: content.preheader, html }
})
