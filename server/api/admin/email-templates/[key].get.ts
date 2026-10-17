import { previewTemplate } from '~~/server/services/mail/send'
import { TEMPLATE_KEYS, TEMPLATE_META, type MailData, type TemplateKey } from '~~/server/services/mail/templates'
import { siteUrl } from '~~/server/services/context'

/** Sample data from the design, for previews. */
function sample(): MailData {
  const created = new Date('2026-10-11T08:20:00Z')
  return {
    to: { name: 'Dimas Saputra', email: 'dimas.saputra@pemkomedan.go.id' },
    event: { name: 'APCR 2026', slug: 'apcr-2026', startDate: '2026-12-02', endDate: '2026-12-04', city: 'Medan', venueName: 'Santika Premiere Dyandra' },
    siteUrl: siteUrl(),
    regNo: 'REG-APCR-26-01248',
    organization: 'Medan City Government',
    ticketTypeName: 'Indonesia Delegate',
    ticketPrice: 2_500_000,
    ticketCode: 'APCR26-ID-0712',
    rejectionReason: 'the assignment letter from your institution was not attached.',
    remainingSeats: 88,
    invoice: {
      no: 'INV-APCR-26-01248',
      total: 2_500_000,
      expiresAt: new Date(created.getTime() + 48 * 3600_000),
      paymentUrl: `${siteUrl()}/payment/finish`,
      methodLabel: 'VA BCA',
      paidAt: new Date('2026-10-12T02:04:00Z'),
      refundAmount: 2_500_000
    }
  }
}

export default defineEventHandler(async (event) => {
  await requireSuperadmin(event)
  const key = getRouterParam(event, 'key') as TemplateKey
  if (!TEMPLATE_KEYS.includes(key)) throw createError({ statusCode: 404, statusMessage: 'Template not found' })
  const { content, html } = await previewTemplate(key, sample())
  return { key, ...TEMPLATE_META[key], subject: content.subject, preheader: content.preheader, html }
})
