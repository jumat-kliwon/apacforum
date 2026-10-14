/** Static copy for the public home page, from the `home-page` frame in docs/design/apcr-design.pen. */

export const HERO = {
  eyebrow: 'ASEAN PUBLIC COMMUNICATION & REPUTATION FORUM',
  title: ['BUILDING TRUST.', 'SHAPING REPUTATION.', 'CONNECTING ASEAN.'],
  date: '2–4 December 2026',
  location: 'Medan, North Sumatra, Indonesia',
  blurb: 'A regional platform connecting government, business, academia and communication leaders to strengthen trust, shape reputation and foster collaboration across ASEAN.'
}

export const ECOSYSTEM = [
  { title: 'The Annual Forum', copy: 'Three days in Medan where the regional agenda is set in the open.' },
  { title: 'The Trust Framework', copy: 'Shared principles and measures for institutional trust across ASEAN.' },
  { title: 'The Knowledge Engine', copy: 'Research, outlooks and case studies published continuously, not once a year.' },
  { title: 'The Community', copy: 'Trust Room, Academy, labs and fellows — the network between editions.' }
]

export const CONSTITUENCIES = [
  {
    title: 'Policy',
    copy: 'Regulators, ministries and public institutions who set the rules and carry public mandate.',
    who: ['Ministries of communication and digital affairs', 'ASEAN secretariat and member delegations', 'Provincial and city government']
  },
  {
    title: 'Business',
    copy: 'Companies and investors whose licence to operate depends on confidence in the market.',
    who: ['Corporate affairs and reputation leaders', 'Investor relations and ESG teams', 'Industry associations and chambers']
  },
  {
    title: 'Communication',
    copy: 'The practitioners and researchers who make trust legible, measurable and defensible.',
    who: ['Agencies and in-house communication teams', 'Academics and research institutes', 'Media, platforms and fact-checking networks']
  }
]

export const PROGRESSION = [
  { place: 'MEDAN', year: '2026', copy: 'Host city of the inaugural forum and home of the first trust labs.' },
  { place: 'INDONESIA', year: '2027', copy: 'A national ecosystem of practitioners, regulators and research partners.' },
  { place: 'ASEAN', year: '2028 →', copy: 'Ten markets working to one shared trust and reputation agenda.' }
]

export const DAYS = [
  { day: 'DAY 01', date: '2 December', title: 'Trust & Policy', copy: 'Opening plenary, the ASEAN trust outlook and a ministerial dialogue on information integrity.' },
  { day: 'DAY 02', date: '3 December', title: 'Business & Reputation', copy: 'Corporate labs, crisis simulations and the investor confidence track with regional analysts.' },
  { day: 'DAY 03', date: '4 December', title: 'Collaboration & Action', copy: 'Framework working groups, partner commitments and the closing Medan declaration.' }
]

export const EDITION_FACTS = [
  { icon: 'i-lucide-calendar', label: '2–4 December 2026' },
  { icon: 'i-lucide-map-pin', label: 'Santika Premiere Dyandra, Medan' },
  { icon: 'i-lucide-users', label: '1,200 delegates from 10 markets' },
  { icon: 'i-lucide-languages', label: 'English with Bahasa interpretation' }
]

export const PRESSURES = [
  { icon: 'i-lucide-shield-alert', title: 'Information Integrity', copy: 'Disinformation, coordinated manipulation and the erosion of a shared factual base.' },
  { icon: 'i-lucide-siren', title: 'Crisis & Resilience', copy: 'How institutions absorb shocks — cyber incidents, product failures, public scandals.' },
  { icon: 'i-lucide-cpu', title: 'Platforms, AI & Algorithms', copy: 'Automated systems that now mediate what the region sees, believes and trusts.' },
  { icon: 'i-lucide-leaf', title: 'Sustainability & ESG Credibility', copy: 'Claims that outrun evidence, and the scrutiny that follows across markets.' },
  { icon: 'i-lucide-trending-up', title: 'Investment & Market Confidence', copy: 'Reputation as a factor in capital flows, sovereign ratings and market access.' },
  { icon: 'i-lucide-landmark', title: 'Public Policy Communication', copy: 'Explaining regulation and public decisions to citizens who no longer take them on faith.' }
]

export const FEATURED_INSIGHT = {
  image: '/landing/knowledge-outlook.jpg',
  alt: 'Analyst reviewing market data on a screen',
  kicker: 'APCR OUTLOOK · FLAGSHIP REPORT',
  title: 'The ASEAN Trust Outlook 2026: where confidence is gained and lost',
  copy: 'A ten-market study of how citizens, investors and employees decide which institutions deserve their confidence — and what reverses the judgement.'
}

export const INSIGHTS = [
  { kind: 'RESEARCH NOTE', title: 'Measuring institutional trust without borrowing Western instruments', date: 'September 2026' },
  { kind: 'CASE STUDY', title: 'A 36-hour cyber incident and the communication that contained it', date: 'August 2026' },
  { kind: 'EXECUTIVE PERSPECTIVE', title: 'What investors actually read before they price reputational risk', date: 'August 2026' },
  { kind: 'PUBLICATION', title: 'Trust Framework consultation draft, version 0.9', date: 'July 2026' }
]

export const PROGRAMMES = [
  { icon: 'i-lucide-lock', title: 'ASEAN Trust Room', copy: 'A closed quarterly room for senior leaders to work through live regional issues under Chatham House rule.', stat: '120 members · 4 sessions a year' },
  { icon: 'i-lucide-flask-conical', title: 'Executive Communication Lab', copy: 'Practitioner clinics where teams bring a real reputation problem and leave with a tested plan.', stat: '8 labs a year · 20 seats each' },
  { icon: 'i-lucide-graduation-cap', title: 'APCR Academy', copy: 'A structured curriculum on trust measurement, crisis practice and public communication.', stat: '300+ alumni across 10 markets' },
  { icon: 'i-lucide-sparkles', title: 'Young Communication Fellows', copy: 'A yearly cohort of practitioners under 30, mentored through a regional research project.', stat: '25 fellows per cohort' }
]

/** Partners with artwork render the logo; the rest render their name set in small caps. */
export const PARTNERS: { name: string, logo?: string }[] = [
  { name: 'Sumut Pos', logo: '/landing/sumut-pos.jpg' },
  { name: 'MATA net', logo: '/landing/matanet.jpg' },
  { name: 'Sumut24.co', logo: '/landing/sumut24.jpg' },
  { name: 'PR INDONESIA' },
  { name: 'Universitas Sumatera Utara' },
  { name: 'ASEAN Business Advisory Council' }
]

export const STORIES = [
  {
    image: '/landing/story-registration.jpg',
    alt: 'Delegates arriving at a conference venue',
    date: '12 October 2026',
    kind: 'PRESS RELEASE',
    title: 'APCR 2026 Opens Delegate Registration Across ASEAN',
    copy: 'Delegations from all ten member states are invited to the inaugural forum in Medan.'
  },
  {
    image: '/landing/story-host-province.jpg',
    alt: 'Medan skyline',
    date: '2 October 2026',
    kind: 'FORUM NEWS',
    title: 'North Sumatra Confirmed as Host Province for the Inaugural Forum',
    copy: 'Three days of plenaries, labs and bilateral meetings at the heart of the region.'
  },
  {
    image: '/landing/story-framework.jpg',
    alt: 'Working group around a table',
    date: '24 September 2026',
    kind: 'PRESS RELEASE',
    title: 'Trust Framework Working Group Publishes First Consultation Draft',
    copy: 'Shared principles for measuring institutional trust, open for regional comment.'
  }
]
