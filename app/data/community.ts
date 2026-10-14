/** Static copy for /community, from the `community-page` frame in docs/design/apcr-design.pen. */

export const TRUST_ROOM_WHO = [
  { icon: 'i-lucide-briefcase', title: 'Chief Executives', copy: 'Leaders who carry the consequence of the decision in the room.' },
  { icon: 'i-lucide-landmark', title: 'Government Leaders', copy: 'Ministers and senior officials with a public mandate at stake.' },
  { icon: 'i-lucide-scale', title: 'Policymakers', copy: 'Those drafting the rules the rest of the region will operate under.' },
  { icon: 'i-lucide-megaphone', title: 'Communication Leaders', copy: 'The practitioners who have to make the outcome legible afterwards.' }
]

export const TRUST_ROOM_FORMAT = [
  { label: 'ACCESS', value: 'By invitation only' },
  { label: 'RULE', value: 'Chatham House' },
  { label: 'RHYTHM', value: 'Four sessions a year' },
  { label: 'SIZE', value: '25 seats per session' }
]

export const LAB_SUBJECTS = [
  { icon: 'i-lucide-handshake', title: 'Trust', copy: 'How confidence is built, measured and lost inside institutions.' },
  { icon: 'i-lucide-award', title: 'Reputation', copy: 'Managing the asset that outlives any single campaign or leader.' },
  { icon: 'i-lucide-siren', title: 'Crisis', copy: 'Decision-making in the hours when information is incomplete.' },
  { icon: 'i-lucide-compass', title: 'Leadership', copy: 'Speaking with authority when the facts are still contested.' },
  { icon: 'i-lucide-cpu', title: 'AI', copy: 'What automated systems change about disclosure, voice and accountability.' },
  { icon: 'i-lucide-users', title: 'Stakeholder Engagement', copy: 'Working with the people whose judgement decides the outcome.' }
]

export const ACADEMY_TRACKS = [
  { title: 'Executive education', copy: 'Short, structured programmes for leaders already carrying the responsibility.' },
  { title: 'Capability development', copy: 'Institution-level work that leaves a team better equipped, not just better informed.' },
  { title: 'Academic & knowledge partners', copy: 'Curriculum co-designed with universities and research institutes in the region.' }
]

export const FELLOWS_FACTS = [
  { value: '25', label: 'fellows per cohort' },
  { value: '12', label: 'months of mentoring' },
  { value: '10', label: 'markets represented' },
  { value: '1', label: 'published study' }
]

/** Membership rules are not in the source document yet; the cards render as skeletons. */
export const COMMUNITY_PLACEHOLDERS = ['Who can join', 'What members get', 'How to join']
