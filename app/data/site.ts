/**
 * Shared chrome for the public site (header nav, footer), transcribed from the
 * `Header / Global Nav` and `Footer / Global` components in
 * docs/design/apcr-design.pen.
 */

export const WHATSAPP_URL = 'https://wa.me/6285161274620'

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
      { label: 'Vision & Mission', to: '/about#vision' },
      { label: 'Why APCR', to: '/about#why' },
      { label: 'From Sumatra to ASEAN', to: '/about#sumatra' },
      { label: 'Governance', to: '/about#governance' }
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
      { label: 'Venue & Travel', to: '/apcr-2026#venue' },
      { label: 'FAQ', to: '/apcr-2026#faq' },
      { label: 'Registration', to: '/apcr-2026#registration' }
    ]
  },
  {
    label: 'Knowledge',
    to: '/knowledge',
    items: [
      { label: 'Insights', to: '/knowledge#insights' },
      { label: 'Research', to: '/knowledge#research' },
      { label: 'APCR Outlook', to: '/knowledge#outlook' },
      { label: 'Case Studies', to: '/knowledge#cases' },
      { label: 'Executive Perspectives', to: '/knowledge#perspectives' },
      { label: 'Publications', to: '/knowledge#publications' }
    ]
  },
  {
    label: 'Community',
    to: '/community',
    items: [
      { label: 'ASEAN Trust Room', to: '/community#trust-room' },
      { label: 'Executive Communication Lab', to: '/community#lab' },
      { label: 'APCR Academy', to: '/community#academy' },
      { label: 'Young Communication Fellows', to: '/community#fellows' },
      { label: 'APCR Community', to: '/community' }
    ]
  },
  {
    label: 'Partners',
    to: '/partners',
    items: [
      { label: 'Our Partners', to: '/partners' },
      { label: 'Become a Partner', to: '/partners#become' }
    ]
  },
  {
    label: 'News & Media',
    to: '/news',
    items: [
      { label: 'Latest News', to: '/news' },
      { label: 'Press Releases', to: '/news#press-releases' },
      { label: 'Media Coverage', to: '/news#coverage' },
      { label: 'Speaker Perspectives', to: '/news#speaker-perspectives' },
      { label: 'Partner Stories', to: '/news#partner-stories' },
      { label: 'Gallery', to: '/news#gallery' },
      { label: 'Media Kit', to: '/news#media-kit' }
    ]
  },
  { label: 'Contact', to: '/contact' }
]

export const FOOTER_BLURB = [
  'BUILDING TRUST.',
  'SHAPING REPUTATION.',
  'CONNECTING ASEAN.',
  '',
  '2–4 December 2026',
  'Medan, North Sumatra, Indonesia',
  '',
  'Initiated by PR INDONESIA'
]

export const FOOTER_COLUMNS: { title: string, links: NavLink[] }[] = [
  {
    title: 'ABOUT',
    links: [
      { label: 'About APCR', to: '/about' },
      { label: 'From Sumatra to ASEAN', to: '/about#sumatra' },
      { label: 'The New Reputation Landscape', to: '/about#why' }
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
      { label: 'About the Initiator', to: '/about' },
      { label: 'Contact via WhatsApp', to: WHATSAPP_URL }
    ]
  }
]

export const FOOTER_LOGOS = [
  { label: 'INITIATED BY', src: '/landing/pr-indonesia.png', alt: 'PR INDONESIA' },
  { label: 'PARTNER', src: '/landing/nolimit.png', alt: 'NoLimit' }
]
