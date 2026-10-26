/**
 * Shared chrome for the public site (header nav, footer). The layout comes from
 * docs/design/apcr-design.pen; the links follow the sections of each page, whose
 * content mirrors apcrforum.com.
 */

export const WHATSAPP_URL = 'https://wa.me/6285229909931'

/**
 * A link whose page has not been built yet omits `to`; the header and footer
 * render those as inert text rather than as links that go nowhere.
 */
export interface NavLink { label: string, to?: string }
export interface NavEntry extends NavLink { items?: NavLink[] }

export const NAV: NavEntry[] = [
  { label: 'Home', to: '/' },
  {
    label: 'About',
    to: '/about',
    items: [
      { label: 'About APCR', to: '/about' },
      { label: 'Why APCR? Why Now?', to: '/about#why' },
      { label: 'The New Reputation Landscape', to: '/about#risks' },
      { label: 'Trust Framework', to: '/about#framework' },
      { label: 'From Sumatra to ASEAN', to: '/about#sumatra' },
      { label: 'About the Initiator', to: '/about#initiator' }
    ]
  },
  {
    label: 'APCR 2026',
    to: '/apcr-2026',
    items: [
      { label: 'Overview', to: '/apcr-2026' },
      { label: 'Programme', to: '/apcr-2026#programme' },
      { label: 'Speakers', to: '/apcr-2026#speakers' },
      { label: 'Who Should Attend', to: '/apcr-2026#audience' },
      { label: 'Venue', to: '/apcr-2026#venue' },
      { label: 'Registration', to: '/apcr-2026#registration' }
    ]
  },
  {
    label: 'Knowledge',
    to: '/knowledge',
    items: [
      { label: 'What APCR Produces', to: '/knowledge#research' },
      { label: 'APCR Research & Outlook', to: '/knowledge#outlook' },
      { label: 'Trust & Reputation Framework', to: '/knowledge#framework' },
      { label: 'Knowledge Forum', to: '/knowledge#forum' }
    ]
  },
  {
    label: 'Partners',
    to: '/partners',
    items: [
      { label: 'Our Partners', to: '/partners' },
      { label: 'About the Initiator', to: '/partners#initiator' },
      { label: 'Become a Partner', to: '/partners#become' }
    ]
  },
  { label: 'News & Media', to: '/news' },
  { label: 'Contact', to: '/contact' }
]

export const FOOTER_BLURB = [
  'BUILDING TRUST.',
  'SHAPING REPUTATION.',
  'CONNECTING ASEAN.',
  '',
  '2–4 December 2026',
  'Auditorium UMSU, Medan, North Sumatra, Indonesia',
  '',
  'Initiated by PR INDONESIA'
]

export const FOOTER_COLUMNS: { title: string, links: NavLink[] }[] = [
  {
    title: 'ABOUT',
    links: [
      { label: 'About APCR', to: '/about' },
      { label: 'From Sumatra to ASEAN', to: '/about#sumatra' },
      { label: 'The New Reputation Landscape', to: '/about#risks' }
    ]
  },
  {
    title: 'APCR 2026',
    links: [
      { label: 'Overview', to: '/apcr-2026' },
      { label: 'Programme', to: '/apcr-2026#programme' },
      { label: 'Registration', to: '/apcr-2026#registration' }
    ]
  },
  {
    title: 'ECOSYSTEM',
    links: [
      { label: 'Knowledge', to: '/knowledge' },
      { label: 'APCR 365', to: '/community' },
      { label: 'News & Media', to: '/news' },
      { label: 'About the Initiator', to: '/about#initiator' },
      { label: 'Contact via WhatsApp', to: WHATSAPP_URL }
    ]
  }
]
