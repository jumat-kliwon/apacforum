import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { userAc } from 'better-auth/plugins/admin/access'
import { uuidv7 } from '../db/columns'
import { db, schema } from '../db'
import { PARTICIPANT_ROLE, SUPERADMIN_ROLE } from '../../shared/utils/access'

/** Participant profile fields: only set on the server (registration form / CMS). */
const profileField = { type: 'string', required: false, input: false } as const

export const auth = betterAuth({
  // production uses BETTER_AUTH_URL; Vercel preview deployments fall back to their own URL
  baseURL: process.env.BETTER_AUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),
  trustedOrigins: [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
    .filter((host): host is string => !!host)
    .map(host => `https://${host}`),
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
    // Roles and permissions live in our own tables (see server/utils/admin.ts). The plugin is kept for the
    // `role` and ban columns; its endpoints (create user, set role, impersonate…) are closed to everyone,
    // because staff accounts are managed through /api/admin/access/**, which enforces the no-escalation rules.
    admin({
      defaultRole: PARTICIPANT_ROLE,
      adminRoles: [SUPERADMIN_ROLE],
      roles: { [SUPERADMIN_ROLE]: userAc, [PARTICIPANT_ROLE]: userAc }
    })
  ]
})
