/** Display labels and badge colors for every enum. Used by the UI and emails. */

export type BadgeColor = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
type Label = { label: string, color: BadgeColor }

export const REGISTRATION_STATUS = {
  pending_verification: { label: 'Pending verification', color: 'warning' },
  verified: { label: 'Verified', color: 'success' },
  rejected: { label: 'Rejected', color: 'error' },
  cancelled: { label: 'Cancelled', color: 'neutral' }
} as const satisfies Record<string, Label>

/** Payment status in the participant table. `none` is told apart by the registration status. */
export const PAYMENT_STATUS = {
  none: { label: 'Not invoiced yet', color: 'neutral' },
  pending: { label: 'Awaiting payment', color: 'warning' },
  paid: { label: 'Paid', color: 'success' },
  expired: { label: 'Expired', color: 'error' },
  refunded: { label: 'Refunded', color: 'neutral' }
} as const satisfies Record<string, Label>

export function paymentStatusLabel(payment: keyof typeof PAYMENT_STATUS, registration?: keyof typeof REGISTRATION_STATUS): Label {
  if (payment === 'none' && (registration === 'rejected' || registration === 'cancelled')) {
    return { label: 'Not invoiced', color: 'neutral' }
  }
  return PAYMENT_STATUS[payment]
}

export const TRANSACTION_STATUS = {
  pending: { label: 'Awaiting payment', color: 'warning' },
  paid: { label: 'Paid', color: 'success' },
  expired: { label: 'Expired', color: 'error' },
  refunded: { label: 'Refunded', color: 'neutral' }
} as const satisfies Record<string, Label>

export const PAYMENT_METHOD = {
  virtual_account: 'Virtual account',
  qris: 'QRIS',
  credit_card: 'Credit card',
  bank_transfer: 'Bank transfer',
  e_wallet: 'E-wallet'
} as const

export const EVENT_STATUS = {
  draft: { label: 'Draft', color: 'neutral' },
  published: { label: 'Published', color: 'success' },
  archived: { label: 'Archived', color: 'neutral' }
} as const satisfies Record<string, Label>

export const PUBLISH_STATUS = {
  draft: { label: 'Draft', color: 'neutral' },
  published: { label: 'Published', color: 'success' }
} as const satisfies Record<string, Label>

export const SPEAKER_CATEGORY = {
  government: 'Government',
  business: 'Business',
  academia: 'Academia',
  communication: 'Communication'
} as const

export const PARTNER_CATEGORY = {
  academic_home: 'Academic Home',
  government_regional: 'Government & Regional Ecosystem Partners',
  strategic: 'Strategic Partners',
  business_industry: 'Business & Industry Partners',
  knowledge_research: 'Knowledge & Research Partners',
  technology: 'Technology Partners',
  media: 'Media Partners'
} as const

export const TSHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as const

export const COUNTRIES = {
  ID: 'Indonesia',
  MY: 'Malaysia',
  SG: 'Singapore',
  TH: 'Thailand',
  VN: 'Vietnam',
  PH: 'Philippines',
  BN: 'Brunei',
  KH: 'Cambodia',
  LA: 'Laos',
  MM: 'Myanmar',
  TL: 'Timor-Leste'
} as const

export const HISTORY_LABEL = {
  created: 'Invoice created',
  invoice_sent: 'Invoice email sent',
  paid: 'Payment received',
  ticket_sent: 'E-ticket sent',
  expired: 'Invoice expired',
  refunded: 'Refund processed',
  note: 'Note'
} as const

/** Turns a label map into `items` for USelect. */
export const toItems = (map: Record<string, string | Label>): { value: string, label: string }[] =>
  Object.entries(map).map(([value, v]) => ({ value, label: typeof v === 'string' ? v : v.label }))

export const TSHIRT_ITEMS: string[] = [...TSHIRT_SIZES]
