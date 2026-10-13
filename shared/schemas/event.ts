import { z } from 'zod'
import { PARTNER_CATEGORY, SPEAKER_CATEGORY } from '../utils/labels'

const isoDate = z.iso.date({ error: 'Format tanggal YYYY-MM-DD' })
const optionalText = (max: number) => z.string().trim().max(max).optional().transform(v => v || null)
const objectKey = z.string().max(300).nullish()

export const agendaDaySchema = z.object({
  id: z.uuid().optional(),
  label: z.string().trim().min(1, 'Wajib diisi').max(80),
  date: isoDate,
  theme: z.string().trim().min(1, 'Wajib diisi').max(255),
  body: z.string().trim().max(5000).default('')
})

export const speakerSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(1, 'Wajib diisi').max(200),
  title: z.string().trim().min(1, 'Wajib diisi').max(255),
  category: z.enum(Object.keys(SPEAKER_CATEGORY) as [keyof typeof SPEAKER_CATEGORY]),
  /** index hari di `agendaDays` (form belum punya id untuk hari baru) */
  agendaDayIndex: z.number().int().min(0).nullable().default(null),
  photoKey: objectKey,
  status: z.enum(['draft', 'published']).default('draft')
})

export const partnerSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(1, 'Wajib diisi').max(200),
  category: z.enum(Object.keys(PARTNER_CATEGORY) as [keyof typeof PARTNER_CATEGORY]),
  logoKey: objectKey
})

export const ticketTypeSchema = z.object({
  id: z.uuid().optional(),
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{1,6}$/, '1–6 huruf/angka, mis. ID'),
  name: z.string().trim().min(1, 'Wajib diisi').max(120),
  price: z.coerce.number<number>().int().min(0, 'Tidak boleh negatif'),
  paxPerTicket: z.coerce.number<number>().int().min(1).max(100).default(1),
  quota: z.coerce.number<number>().int().min(0, 'Tidak boleh negatif'),
  isOnSale: z.boolean().default(true)
})

export const eventFormSchema = z.object({
  name: z.string().trim().min(1, 'Wajib diisi').max(200),
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2,8}$/, '2–8 huruf/angka, mis. APCR'),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Huruf kecil, angka, dan tanda hubung'),
  tagline: optionalText(255),
  description: z.string().trim().max(10000).default(''),
  startDate: isoDate,
  endDate: isoDate,
  /** tanggal; batas berlaku sampai 23.59 di zona waktu event */
  registrationDeadline: isoDate,
  venueName: z.string().trim().min(1, 'Wajib diisi').max(200),
  venueAddress: optionalText(500),
  city: z.string().trim().min(1, 'Wajib diisi').max(120),
  capacity: z.coerce.number<number>().int().min(0, 'Tidak boleh negatif'),
  bannerKey: objectKey,
  registrationOpen: z.boolean().default(true),
  status: z.enum(['draft', 'published']),
  agendaDays: z.array(agendaDaySchema).max(14).default([]),
  speakers: z.array(speakerSchema).max(200).default([]),
  partners: z.array(partnerSchema).max(200).default([]),
  ticketTypes: z.array(ticketTypeSchema).max(20).default([])
}).superRefine((v, ctx) => {
  if (v.endDate < v.startDate) {
    ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'Tidak boleh sebelum tanggal mulai' })
  }
  if (v.registrationDeadline > v.endDate) {
    ctx.addIssue({ code: 'custom', path: ['registrationDeadline'], message: 'Tidak boleh setelah event selesai' })
  }
  const codes = v.ticketTypes.map(t => t.code)
  codes.forEach((c, i) => {
    if (codes.indexOf(c) !== i) ctx.addIssue({ code: 'custom', path: ['ticketTypes', i, 'code'], message: 'Kode tiket sudah dipakai' })
  })
  v.speakers.forEach((s, i) => {
    if (s.agendaDayIndex !== null && s.agendaDayIndex >= v.agendaDays.length) {
      ctx.addIssue({ code: 'custom', path: ['speakers', i, 'agendaDayIndex'], message: 'Hari tidak ada' })
    }
  })
  if (v.status === 'published' && v.ticketTypes.length === 0) {
    ctx.addIssue({ code: 'custom', path: ['ticketTypes'], message: 'Event yang dipublikasikan butuh minimal satu tipe tiket' })
  }
})

export type EventFormInput = z.input<typeof eventFormSchema>
export type EventForm = z.output<typeof eventFormSchema>
