/**
 * Static copy for /community (APCR 365). The copy follows the live landing page at
 * apcrforum.com, which is the single source of truth for public information: it comes from
 * `home.ts` and `programme-rundown.ts`, so this file only selects from them.
 */
import { AUDIENCE, OUTPUTS } from '~/data/home'
import { PROGRAMME } from '~/data/programme-rundown'

/** Finds a known entry in the landing data, failing loudly if that copy is ever renamed. */
function pick<T>(list: T[], match: (item: T) => boolean, what: string): T {
  const found = list.find(match)
  if (!found) throw new Error(`Landing copy not found: ${what}`)
  return found
}

const output = (title: string) => pick(OUTPUTS, o => o.title === title, title)

/** The year-round parts of the ecosystem the landing names, with their anchor ids. */
export const YEAR_ROUND = [
  { id: 'trust-room', ...output('ASEAN Trust Room') },
  { id: 'academy', ...output('Executive Education') },
  { id: 'collaboration', ...output('Academic–Industry Collaboration') },
  { id: 'network', ...output('ASEAN Professional Network') }
]

export const NEXT_GENERATION = pick(AUDIENCE, a => a.title === 'NEXT GENERATION', 'Next Generation audience')

const day3 = pick(PROGRAMME, d => d.id === 'day3', 'Day 3')
const leaders = pick(day3.rows, r => r.title === 'FUTURE ASEAN LEADERS DIALOGUE', 'Future ASEAN Leaders Dialogue')

export const LEADERS_DIALOGUE = { ...leaders, when: `${day3.date} · ${leaders.time}` }
