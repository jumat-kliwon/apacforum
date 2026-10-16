/**
 * Static copy for /contact. The copy follows apcrforum.com, whose only published
 * contact channel is WhatsApp (`WHATSAPP_URL` in site.ts); nothing here adds
 * addresses, numbers or service levels the landing page does not state.
 */
import { HERO } from './home'
import { WHATSAPP_URL } from './site'

/** `https://wa.me/6285229909931` → `+62 852-2990-9931`. */
const digits = WHATSAPP_URL.split('/').pop() ?? ''
export const WHATSAPP_DISPLAY = `+${digits.slice(0, 2)} ${digits.slice(2, 5)}-${digits.slice(5, 9)}-${digits.slice(9)}`

/** Generic enquiry types for the message form. */
export const TOPICS = [
  'Registration for APCR 2026',
  'Partnership',
  'Media',
  'Academic & Research Collaboration',
  'General enquiry'
]

export const COUNTRIES = [
  'Brunei Darussalam', 'Cambodia', 'Indonesia', 'Lao PDR', 'Malaysia',
  'Myanmar', 'Philippines', 'Singapore', 'Thailand', 'Viet Nam', 'Other'
]

export const AT_A_GLANCE = [
  { label: 'Event', value: 'APCR 2026' },
  { label: 'Dates', value: HERO.date },
  { label: 'Location', value: HERO.location },
  { label: 'Initiated by', value: 'PR INDONESIA' }
]
