import * as z from 'zod'
import { PERMISSION_KEYS } from '../utils/access'

const optionalText = (max: number) => z.string().trim().max(max).nullish().transform(v => v || null)
const password = z.string().min(12, 'At least 12 characters').max(128)

export const roleFormSchema = z.object({
  name: z.string().trim().min(1, 'Required').max(80),
  description: optionalText(255),
  permissions: z.array(z.enum(PERMISSION_KEYS as [string, ...string[]])).max(PERMISSION_KEYS.length)
})
export type RoleForm = z.output<typeof roleFormSchema>

export const staffCreateSchema = z.object({
  name: z.string().trim().min(1, 'Required').max(200),
  email: z.email('Enter a valid email').trim().toLowerCase().max(254),
  role: z.string().min(1, 'Choose a role').max(40),
  password
})
export type StaffCreate = z.output<typeof staffCreateSchema>

/** Every field is optional: the CMS sends only what changed. */
export const staffUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Required').max(200).optional(),
  role: z.string().min(1).max(40).optional(),
  /** false = deactivated: cannot sign in, open sessions are ended. */
  active: z.boolean().optional(),
  password: password.optional()
})
export type StaffUpdate = z.output<typeof staffUpdateSchema>

export const staffListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().refine(n => [10, 25, 50, 100].includes(n)).default(10),
  q: z.string().trim().max(100).optional(),
  role: z.string().max(40).optional()
})

/** Role key from a role name, e.g. "Finance team" → `finance-team`. */
export const roleKey = (name: string) => name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
