import { pgEnum } from 'drizzle-orm/pg-core'

export const eventStatus = pgEnum('event_status', ['draft', 'published', 'archived'])

export const publishStatus = pgEnum('publish_status', ['draft', 'published'])

export const speakerCategory = pgEnum('speaker_category', ['government', 'business', 'academia', 'communication'])

export const partnerCategory = pgEnum('partner_category', [
  'academic_home',
  'government_regional',
  'strategic',
  'business_industry',
  'knowledge_research',
  'technology',
  'media'
])

export const tshirtSize = pgEnum('tshirt_size', ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'])

export const registrationStatus = pgEnum('registration_status', ['pending_verification', 'verified', 'rejected', 'cancelled'])

/** Disalin dari transaksi terakhir peserta; `none` = belum/tidak ditagih. */
export const paymentStatus = pgEnum('payment_status', ['none', 'pending', 'paid', 'expired', 'refunded'])

export const transactionStatus = pgEnum('transaction_status', ['pending', 'paid', 'expired', 'refunded'])

export const paymentMethod = pgEnum('payment_method', ['virtual_account', 'qris', 'credit_card', 'bank_transfer', 'e_wallet'])
