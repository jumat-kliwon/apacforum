import { z } from 'zod'
import { PAYMENT_STATUS, REGISTRATION_STATUS, TSHIRT_SIZES, TRANSACTION_STATUS, PAYMENT_METHOD } from '../utils/labels'

const optional = (max: number) => z.string().trim().max(max).optional().transform(v => v || null)

/** Data diri peserta — form Registration publik & "Edit data peserta" di CMS. */
export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Wajib diisi').max(200),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{8,20}$/, 'Nomor telepon tidak valid'),
  organization: z.string().trim().min(1, 'Wajib diisi').max(200),
  jobTitle: z.string().trim().min(1, 'Wajib diisi').max(200),
  country: z.string().trim().length(2, 'Pilih negara').toUpperCase(),
  city: z.string().trim().min(1, 'Wajib diisi').max(120),
  tshirtSize: z.enum(TSHIRT_SIZES).nullish().transform(v => v ?? null),
  mealPreference: optional(60),
  referralSource: optional(120)
})

export const registrationSchema = profileSchema.extend({
  email: z.email('Email tidak valid').trim().toLowerCase().max(320),
  ticketTypeId: z.uuid('Pilih tipe peserta'),
  agree: z.literal(true, { error: 'Wajib disetujui' })
})

export type RegistrationInput = z.input<typeof registrationSchema>

const page = {
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().refine(n => [10, 25, 50, 100].includes(n)).default(10),
  dir: z.enum(['asc', 'desc']).default('desc')
}

export const participantListQuery = z.object({
  ...page,
  q: z.string().trim().max(100).optional(),
  eventId: z.uuid().optional(),
  ticketTypeName: z.string().max(120).optional(),
  status: z.enum(Object.keys(REGISTRATION_STATUS) as [keyof typeof REGISTRATION_STATUS]).optional(),
  paymentStatus: z.enum(Object.keys(PAYMENT_STATUS) as [keyof typeof PAYMENT_STATUS]).optional(),
  sort: z.enum(['name', 'type', 'event', 'org', 'reg', 'pay', 'date']).default('date')
})

export const transactionListQuery = z.object({
  ...page,
  q: z.string().trim().max(100).optional(),
  eventId: z.uuid().optional(),
  status: z.enum(Object.keys(TRANSACTION_STATUS) as [keyof typeof TRANSACTION_STATUS]).optional(),
  method: z.enum(Object.keys(PAYMENT_METHOD) as [keyof typeof PAYMENT_METHOD]).optional(),
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
  sort: z.enum(['id', 'name', 'type', 'event', 'amount', 'method', 'status', 'date']).default('date')
})

export const bulkParticipantSchema = z.object({
  action: z.enum(['verify', 'email', 'delete']),
  ids: z.array(z.uuid()).min(1).max(500)
})

export const rejectSchema = z.object({
  reason: z.string().trim().min(3, 'Tulis alasan penolakan').max(1000)
})

export const refundSchema = z.object({
  note: z.string().trim().max(1000).optional()
})
