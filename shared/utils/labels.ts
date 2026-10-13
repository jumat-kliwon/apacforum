/** Label Bahasa Indonesia + warna badge untuk semua enum. Dipakai UI dan email. */

export type BadgeColor = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
type Label = { label: string, color: BadgeColor }

export const REGISTRATION_STATUS = {
  pending_verification: { label: 'Menunggu verifikasi', color: 'warning' },
  verified: { label: 'Terverifikasi', color: 'success' },
  rejected: { label: 'Ditolak', color: 'error' },
  cancelled: { label: 'Dibatalkan', color: 'neutral' }
} as const satisfies Record<string, Label>

/** Status bayar di tabel peserta. `none` dibedakan oleh status pendaftaran. */
export const PAYMENT_STATUS = {
  none: { label: 'Belum ditagih', color: 'neutral' },
  pending: { label: 'Menunggu pembayaran', color: 'warning' },
  paid: { label: 'Lunas', color: 'success' },
  expired: { label: 'Kedaluwarsa', color: 'error' },
  refunded: { label: 'Refund', color: 'neutral' }
} as const satisfies Record<string, Label>

export function paymentStatusLabel(payment: keyof typeof PAYMENT_STATUS, registration?: keyof typeof REGISTRATION_STATUS): Label {
  if (payment === 'none' && (registration === 'rejected' || registration === 'cancelled')) {
    return { label: 'Tidak ditagih', color: 'neutral' }
  }
  return PAYMENT_STATUS[payment]
}

export const TRANSACTION_STATUS = {
  pending: { label: 'Menunggu pembayaran', color: 'warning' },
  paid: { label: 'Lunas', color: 'success' },
  expired: { label: 'Kedaluwarsa', color: 'error' },
  refunded: { label: 'Refund', color: 'neutral' }
} as const satisfies Record<string, Label>

export const PAYMENT_METHOD = {
  virtual_account: 'Virtual Account',
  qris: 'QRIS',
  credit_card: 'Kartu kredit',
  bank_transfer: 'Transfer bank',
  e_wallet: 'E-wallet'
} as const

export const EVENT_STATUS = {
  draft: { label: 'Draft', color: 'neutral' },
  published: { label: 'Published', color: 'success' },
  archived: { label: 'Arsip', color: 'neutral' }
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

export const HISTORY_LABEL = {
  created: 'Tagihan dibuat',
  invoice_sent: 'Email tagihan terkirim',
  paid: 'Pembayaran diterima',
  ticket_sent: 'E-tiket terkirim',
  expired: 'Tagihan kedaluwarsa',
  refunded: 'Refund diproses',
  note: 'Catatan'
} as const

/** Ubah map label jadi `items` untuk USelect. */
export const toItems = <T extends Record<string, string | Label>>(map: T) =>
  Object.entries(map).map(([value, v]) => ({ value: value as keyof T & string, label: typeof v === 'string' ? v : v.label }))
