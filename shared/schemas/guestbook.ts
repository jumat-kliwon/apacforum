import * as z from 'zod'

/** Blank optional fields are stored as null, not ''. */
const optional = (max: number) => z.string().trim().max(max).optional().transform(v => v || null)

/** The /contact form. Only name and email are required. */
export const guestbookEntrySchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(200),
  email: z.email('Enter a valid email').trim().toLowerCase().max(320),
  institution: optional(200),
  position: optional(200),
  country: optional(120),
  topic: optional(120),
  message: z.string().trim().max(5000).optional().transform(v => v ?? '')
})

export type GuestbookEntryInput = z.input<typeof guestbookEntrySchema>
export type GuestbookEntry = z.output<typeof guestbookEntrySchema>

export const guestbookListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().refine(n => [10, 25, 50, 100].includes(n)).default(10),
  dir: z.enum(['asc', 'desc']).default('desc'),
  q: z.string().trim().max(100).optional(),
  eventId: z.uuid(),
  topic: z.string().trim().max(120).optional(),
  sort: z.enum(['date', 'name', 'country']).default('date')
})
