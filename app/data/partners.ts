/** Static copy for /partners, from the `partners-page` frame in docs/design/apcr-design.pen. */

export const ACADEMIC_HOME = {
  tile: 'UNIVERSITAS SUMATERA UTARA',
  kicker: '01 · ACADEMIC HOME',
  title: 'The institution that holds APCR\'s academic work',
  copy: 'One standing academic host for the forum: curriculum oversight, research methodology and the scholarly standard every APCR publication is held to.'
}

/** Partners with artwork render the logo; the rest render their name set in small caps. */
export interface PartnerTile { name: string, logo?: string }

export const PARTNER_GROUPS: { label: string, note: string, tiles: PartnerTile[] }[] = [
  {
    label: '02 · GOVERNMENT & REGIONAL ECOSYSTEM PARTNERS',
    note: 'Mandate, policy access and the regional convening power',
    tiles: [
      { name: 'Ministry of Communication & Digital Affairs' },
      { name: 'Provincial Government of North Sumatra' },
      { name: 'Medan City Government' },
      { name: 'ASEAN Business Advisory Council' }
    ]
  },
  {
    label: '03 · STRATEGIC PARTNERS',
    note: 'Agenda, funding and the long-term direction of the forum',
    tiles: [
      { name: 'PR INDONESIA' },
      { name: 'KADIN Sumatera Utara' },
      { name: 'Bank Sumut' },
      { name: 'Medan Convention Bureau' }
    ]
  },
  {
    label: '04 · BUSINESS & INDUSTRY PARTNERS',
    note: 'The sectors whose reputation the region trades on',
    tiles: [
      { name: 'Garuda Indonesia' },
      { name: 'Telkom Indonesia' },
      { name: 'Nusantara Energy' },
      { name: 'Meridian Infrastructure' },
      { name: 'Santika Hospitality' }
    ]
  },
  {
    label: '05 · KNOWLEDGE & RESEARCH PARTNERS',
    note: 'Methodology, data and peer review behind the Outlook',
    tiles: [
      { name: 'Nanyang Centre for Trust Studies' },
      { name: 'ASEAN Policy Institute' },
      { name: 'Reputation Lab Asia' },
      { name: 'Universitas Indonesia' }
    ]
  },
  {
    label: '06 · TECHNOLOGY PARTNERS',
    note: 'The platforms and instrumentation the research runs on',
    tiles: [
      { name: 'Nusantara Cloud' },
      { name: 'Trustlayer Asia' },
      { name: 'Metrix Analytics' },
      { name: 'Sinar Data' }
    ]
  },
  {
    label: '07 · MEDIA PARTNERS',
    note: 'Regional distribution and newsroom access',
    tiles: [
      { name: 'Sumut Pos', logo: '/landing/sumut-pos.jpg' },
      { name: 'MATA net', logo: '/landing/matanet.jpg' },
      { name: 'Sumut24.co', logo: '/landing/sumut24.jpg' }
    ]
  }
]

export const BENEFITS = [
  { icon: 'i-lucide-award', title: 'Thought Leadership', copy: 'A platform to put your institution\'s position in front of the people who set the regional agenda.' },
  { icon: 'i-lucide-globe', title: 'ASEAN Visibility', copy: 'Presence across ten markets through the forum, the Outlook and year-round publication.' },
  { icon: 'i-lucide-users', title: 'Business Network', copy: 'Direct access to delegations, boards and corporate affairs leaders from across the region.' },
  { icon: 'i-lucide-graduation-cap', title: 'Knowledge Collaboration', copy: 'Co-authored research, curriculum input and a named role in the Trust Framework.' },
  { icon: 'i-lucide-handshake', title: 'Stakeholder Engagement', copy: 'Structured rooms with regulators, investors, academics and media in one place.' },
  { icon: 'i-lucide-trending-up', title: 'Regional Impact', copy: 'A contribution that outlasts the event: frameworks, standards and published evidence.' }
]

export const STEPS = [
  { title: 'Request the prospectus', copy: 'Category details, audience data and availability, sent within one working day.' },
  { title: 'Scope the partnership', copy: 'A 45-minute call with the secretariat to match your objectives to the programme.' },
  { title: 'Confirm before 7 November 2026', copy: 'Signed agreement and brand assets in time for the delegate handbook.' }
]
