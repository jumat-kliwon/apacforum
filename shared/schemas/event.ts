import * as z from 'zod'
import { PARTNER_CATEGORY, SPEAKER_CATEGORY } from '../utils/labels'
import { CURRENCIES } from '../utils/money'

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

/** One speaker — the form on the Speakers page. The event cannot change after it is created. */
export const speakerFormSchema = z.object({
  eventId: z.uuid('Choose an event'),
  name: z.string().trim().min(1, 'Required').max(200),
  title: z.string().trim().min(1, 'Required').max(255),
  category: z.enum(Object.keys(SPEAKER_CATEGORY) as [keyof typeof SPEAKER_CATEGORY]),
  /** The agenda day of the speaker's session; null when not tied to a day. */
  agendaDayId: z.uuid().nullable().default(null),
  photoKey: objectKey,
  status: z.enum(['draft', 'published']).default('draft')
})

export type SpeakerFormInput = z.input<typeof speakerFormSchema>
export type SpeakerForm = z.output<typeof speakerFormSchema>

export const speakerListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().refine(n => [10, 25, 50, 100].includes(n)).default(10),
  dir: z.enum(['asc', 'desc']).default('asc'),
  q: z.string().trim().max(100).optional(),
  eventId: z.uuid().optional(),
  category: z.enum(Object.keys(SPEAKER_CATEGORY) as [keyof typeof SPEAKER_CATEGORY]).optional(),
  status: z.enum(['draft', 'published']).optional(),
  sort: z.enum(['order', 'name', 'category', 'session', 'status']).default('order')
})

/** One partner — the form on the Partners page. The event cannot change after it is created. */
export const partnerFormSchema = z.object({
  eventId: z.uuid('Choose an event'),
  name: z.string().trim().min(1, 'Required').max(200),
  category: z.enum(Object.keys(PARTNER_CATEGORY) as [keyof typeof PARTNER_CATEGORY]),
  logoKey: objectKey,
  /** Where the logo links to on the website. Optional. */
  websiteUrl: z.url({ protocol: /^https?$/, error: 'Enter a full URL starting with https://' }).max(500).nullish().or(z.literal('')).transform(v => v || null),
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
  /** In major units of the event's currency (e.g. `149.5` USD); the server stores minor units. */
  price: z.coerce.number<number>().min(0, 'Cannot be negative').refine(v => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, 'At most 2 decimals'),
  paxPerTicket: z.coerce.number<number>().int().min(1).max(100).default(1),
  quota: z.coerce.number<number>().int().min(0, 'Cannot be negative'),
  isOnSale: z.boolean().default(true),
  /** An early-bird ticket needs `earlyBirdUntil`; off clears it. */
  isEarlyBird: z.boolean().default(false),
  /** A date; the ticket can be bought until 23:59 WIB on that day. */
  earlyBirdUntil: isoDate.nullish().or(z.literal('')).transform(v => v || null)
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
  /** Currency of every ticket price; locked once the event has a paid ticket type. */
  currency: z.enum(CURRENCIES).default('IDR'),
  bannerKey: objectKey,
  registrationOpen: z.boolean().default(true),
  /** Saving with this on takes the default from whichever event had it. */
  isDefault: z.boolean().default(false),
  status: z.enum(['draft', 'published']),
  agendaDays: z.array(agendaDaySchema).max(14).default([])
}).superRefine((v, ctx) => {
  if (v.endDate < v.startDate) {
    ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'Cannot be before the start date' })
  }
  if (v.registrationDeadline > v.endDate) {
    ctx.addIssue({ code: 'custom', path: ['registrationDeadline'], message: 'Cannot be after the event ends' })
  }
})

export type EventFormInput = z.input<typeof eventFormSchema>
export type EventForm = z.output<typeof eventFormSchema>

/** One ticket type — the form on the Tickets page. The event cannot change after it is created. */
export const ticketTypeFormSchema = ticketTypeSchema.omit({ id: true }).extend({
  eventId: z.uuid('Choose an event')
}).superRefine((v, ctx) => {
  if (v.isEarlyBird && !v.earlyBirdUntil) {
    ctx.addIssue({ code: 'custom', path: ['earlyBirdUntil'], message: 'Required for an early-bird ticket' })
  }
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
