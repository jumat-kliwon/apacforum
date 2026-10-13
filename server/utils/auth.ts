import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { uuidv7 } from '../db/columns'
import { db, schema } from '../db'

export const ROLES = ['admin', 'participant'] as const
export type Role = typeof ROLES[number]

/** Participant profile fields: only set on the server (registration form / CMS). */
const profileField = { type: 'string', required: false, input: false } as const

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: 'pg', usePlural: true, schema }),
  advanced: {
    database: { generateId: () => uuidv7() }
  },
  emailAndPassword: {
    enabled: true,
    // admins are created by the seed or another admin; participants are created when they register for an event
    disableSignUp: true
  },
  user: {
    additionalFields: {
      phone: profileField,
      organization: profileField,
      jobTitle: profileField,
      country: profileField,
      city: profileField,
      tshirtSize: profileField,
      mealPreference: profileField,
      referralSource: profileField
    }
  },
  plugins: [
    admin({ defaultRole: 'participant', adminRoles: ['admin'] })
  ]
})
