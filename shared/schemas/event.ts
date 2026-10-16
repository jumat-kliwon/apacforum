import * as z from 'zod'
import { PARTNER_CATEGORY, SPEAKER_CATEGORY } from '../utils/labels'

const isoDate = z.iso.date({ error: 'Use the YYYY-MM-DD format' })
const optionalText = (max: number) => z.string().trim().max(max).nullish().transform(v => v || null)
const objectKey = z.string().max(300).nullish()

export const agendaDaySchema = z.object({
  id: z.uuid().optional(),
  label: z.string().trim().min(1, 'Required').max(80),
  date: isoDate,
  theme: z.string().trim().min(1, 'Required').max(255),
  body: z.string().trim().max(5000).default('')
})

export const speakerSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(1, 'Required').max(200),
  title: z.string().trim().min(1, 'Required').max(255),
  category: z.enum(Object.keys(SPEAKER_CATEGORY) as [keyof typeof SPEAKER_CATEGORY]),
  /** Index into `agendaDays` (new days have no id yet while editing). */
  agendaDayIndex: z.number().int().min(0).nullable().default(null),
  photoKey: objectKey,
  status: z.enum(['draft', 'published']).default('draft')
})

/** One partner — the form on the Partners page. The event cannot change after it is created. */
export const partnerFormSchema = z.object({
  eventId: z.uuid('Choose an event'),
  name: z.string().trim().min(1, 'Required').max(200),
  category: z.enum(Object.keys(PARTNER_CATEGORY) as [keyof typeof PARTNER_CATEGORY]),
  logoKey: objectKey,
  showHome: z.boolean().default(false)
})

export type PartnerFormInput = z.input<typeof partnerFormSchema>
export type PartnerForm = z.output<typeof partnerFormSchema>

export const partnerListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().refine(n => [10, 25, 50, 100].includes(n)).default(10),
  dir: z.enum(['asc', 'desc']).default('asc'),
  q: z.string().trim().max(100).optional(),
  eventId: z.uuid().optional(),
  category: z.enum(Object.keys(PARTNER_CATEGORY) as [keyof typeof PARTNER_CATEGORY]).optional(),
  home: z.enum(['shown', 'hidden']).optional(),
  sort: z.enum(['order', 'name', 'category', 'home']).default('order')
})

export const ticketTypeSchema = z.object({
  id: z.uuid().optional(),
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{1,6}$/, '1–6 letters or digits, e.g. ID'),
  name: z.string().trim().min(1, 'Required').max(120),
  price: z.coerce.number<number>().int().min(0, 'Cannot be negative'),
  paxPerTicket: z.coerce.number<number>().int().min(1).max(100).default(1),
  quota: z.coerce.number<number>().int().min(0, 'Cannot be negative'),
  isOnSale: z.boolean().default(true)
})

export const eventFormSchema = z.object({
  name: z.string().trim().min(1, 'Required').max(200),
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2,8}$/, '2–8 letters or digits, e.g. APCR'),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Lowercase letters, digits and hyphens'),
  tagline: optionalText(255),
  description: z.string().trim().max(10000).default(''),
  startDate: isoDate,
  endDate: isoDate,
  /** A date; registration closes at 23:59 WIB on that day. */
  registrationDeadline: isoDate,
  venueName: z.string().trim().min(1, 'Required').max(200),
  venueAddress: optionalText(500),
  city: z.string().trim().min(1, 'Required').max(120),
  capacity: z.coerce.number<number>().int().min(0, 'Cannot be negative'),
  bannerKey: objectKey,
  registrationOpen: z.boolean().default(true),
  /** Saving with this on takes the default from whichever event had it. */
  isDefault: z.boolean().default(false),
  status: z.enum(['draft', 'published']),
  agendaDays: z.array(agendaDaySchema).max(14).default([]),
  speakers: z.array(speakerSchema).max(200).default([])
}).superRefine((v, ctx) => {
  if (v.endDate < v.startDate) {
    ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'Cannot be before the start date' })
  }
  if (v.registrationDeadline > v.endDate) {
    ctx.addIssue({ code: 'custom', path: ['registrationDeadline'], message: 'Cannot be after the event ends' })
  }
  v.speakers.forEach((s, i) => {
    if (s.agendaDayIndex !== null && s.agendaDayIndex >= v.agendaDays.length) {
      ctx.addIssue({ code: 'custom', path: ['speakers', i, 'agendaDayIndex'], message: 'Day does not exist' })
    }
  })
})

export type EventFormInput = z.input<typeof eventFormSchema>
export type EventForm = z.output<typeof eventFormSchema>

/** One ticket type — the form on the Tickets page. The event cannot change after it is created. */
export const ticketTypeFormSchema = ticketTypeSchema.omit({ id: true }).extend({
  eventId: z.uuid('Choose an event')
})

export type TicketTypeFormInput = z.input<typeof ticketTypeFormSchema>
export type TicketTypeForm = z.output<typeof ticketTypeFormSchema>

export const ticketTypeListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().refine(n => [10, 25, 50, 100].includes(n)).default(10),
  dir: z.enum(['asc', 'desc']).default('asc'),
  q: z.string().trim().max(100).optional(),
  eventId: z.uuid().optional(),
  status: z.enum(['on_sale', 'off_sale']).optional(),
  sort: z.enum(['name', 'event', 'price', 'sold', 'status']).default('event')
})
