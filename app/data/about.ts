/** Static copy for /about, from the `about-page` frame in docs/design/apcr-design.pen. */

export const MISSION = [
  { title: 'To connect leaders and institutions', copy: 'Across government, business, academia and communication — in one standing regional network.' },
  { title: 'To advance knowledge and practice', copy: 'In public communication, trust and reputation, through research, frameworks and shared casework.' },
  { title: 'To strengthen cross-border dialogue', copy: 'So that collaboration across ASEAN happens before a crisis forces it.' },
  { title: 'To develop future-ready leaders', copy: 'Building the institutions and individuals the next decade of the region will depend on.' }
]

export const FORCES = [
  { icon: 'i-lucide-cpu', title: 'Artificial intelligence', copy: 'Systems that now generate, rank and mediate what the region reads.' },
  { icon: 'i-lucide-shield-alert', title: 'Misinformation & disinformation', copy: 'Falsehoods that cross markets faster than any institution can correct them.' },
  { icon: 'i-lucide-globe', title: 'Cross-border business', copy: 'Companies operating in ten jurisdictions with one shared reputation.' },
  { icon: 'i-lucide-leaf', title: 'Sustainability', copy: 'Claims and commitments that are now audited in public.' },
  { icon: 'i-lucide-scale', title: 'Geopolitics', copy: 'A region asked to take positions, and judged on how it explains them.' }
]

export const ROLES = [
  { title: 'Understand stakeholders', copy: 'Know who is judging the institution, on what evidence, and how fast.' },
  { title: 'Strengthen leadership', copy: 'Give leaders language that holds up in public, not only in the boardroom.' },
  { title: 'Manage risk', copy: 'See reputational exposure early enough for it to still be a choice.' },
  { title: 'Build reputation', copy: 'Accumulate credibility deliberately instead of hoping it accrues.' },
  { title: 'Create confidence', copy: 'Convert credibility into investment, adoption and cooperation.' },
  { title: 'Enable collaboration', copy: 'Make joint action possible between institutions that rarely share a table.' }
]

export const AMBITIONS = [
  {
    icon: 'i-lucide-arrow-up-right',
    label: 'SUMATRA → ASEAN',
    title: 'Carrying the potential outward',
    copy: 'Taking the industries, institutions and talent of Sumatra to a regional audience of investors, policymakers and partners who rarely see them up close.'
  },
  {
    icon: 'i-lucide-arrow-down-left',
    label: 'ASEAN → SUMATRA',
    title: 'Bringing the region home',
    copy: 'Returning regional networks, standards and opportunity to Sumatra and the wider Indonesian ecosystem, so the benefit does not end when the forum does.'
  }
]

export const PILLARS = [
  { label: 'POLICY', title: 'Effective Governance and Public Trust', copy: 'Public institutions that can explain their decisions, and are believed when they do.' },
  { label: 'BUSINESS', title: 'Sustainable Growth and Regional Opportunities', copy: 'Companies whose conduct and disclosure hold up across ten jurisdictions at once.' },
  { label: 'COMMUNICATION', title: 'Reputation, Engagement and Impact', copy: 'The discipline that makes trust visible, measurable and defensible over time.' }
]

/**
 * Governance bodies are rendered with skeleton bars instead of names: the client
 * has not supplied the governance document yet, and the design calls that out
 * explicitly rather than inventing placeholder people.
 */
export const BODIES = [
  { title: 'Steering Committee', copy: 'Sets direction, approves the annual agenda and holds the forum to its mandate.' },
  { title: 'Advisory Board', copy: 'Regional advisers on policy, business and academic relevance of the programme.' },
  { title: 'Programme Committee', copy: 'Reviews sessions, speakers and the research agenda for each edition.' },
  { title: 'Secretariat', copy: 'Day-to-day delivery, partnerships, communication and delegate operations.' }
]
