/**
 * Static copy for /knowledge. The copy follows the live landing page at apcrforum.com, which
 * is the single source of truth for public information: the outputs come from `home.ts` and
 * the Day 3 sessions from `programme-rundown.ts`, so this file only selects from them.
 */
import { OUTPUTS } from '~/data/home'
import { PROGRAMME } from '~/data/programme-rundown'

/** Finds a known entry in the landing data, failing loudly if that copy is ever renamed. */
function pick<T>(list: T[], match: (item: T) => boolean, what: string): T {
  const found = list.find(match)
  if (!found) throw new Error(`Landing copy not found: ${what}`)
  return found
}

/** Day 3 — the ASEAN Knowledge, Trust & Reputation Forum. */
export const KNOWLEDGE_DAY = pick(PROGRAMME, d => d.id === 'day3', 'Day 3')

const forum = pick(KNOWLEDGE_DAY.rows, r => r.title === 'APCR KNOWLEDGE FORUM', 'APCR Knowledge Forum')
const measure = pick(KNOWLEDGE_DAY.rows, r => r.details?.[0] === 'CAN TRUST BE MEASURED?', 'Can trust be measured?')

export const RESEARCH_OUTLOOK = {
  output: pick(OUTPUTS, o => o.title === 'APCR Research & Outlook', 'APCR Research & Outlook output'),
  session: { ...forum, when: `${KNOWLEDGE_DAY.date} · ${forum.time}` }
}

export const TRUST_FRAMEWORK = {
  output: pick(OUTPUTS, o => o.title === 'ASEAN Trust & Reputation Framework', 'ASEAN Trust & Reputation Framework output'),
  session: { ...measure, when: `${KNOWLEDGE_DAY.date} · ${measure.time}` }
}
