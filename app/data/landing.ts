/** Static copy for the public landing page (APCR 2026). */

export interface EditorialRow { title: string, copy: string }
export interface RundownRow {
  time: string
  title: string
  details?: string[]
  issues?: string[]
  /** Section heading that groups the rows below it. */
  group?: boolean
}
export interface ProgrammeDay {
  id: string
  date: string
  question: string
  name: string
  theme: string
  summary: string
  rows: RundownRow[]
}

export const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Trust Framework', href: '#framework' },
  { label: 'APCR 2026', href: '#apcr2026' },
  { label: 'Knowledge', href: '#knowledge' },
  { label: 'APCR 365', href: '#apcr365' }
]

export const RISKS: EditorialRow[] = [
  { title: 'DEEPFAKE & IMPERSONATION', copy: 'AI-generated video, voice and content can imitate government leaders, CEOs and trusted institutions.' },
  { title: 'ONLINE SCAMS & DIGITAL FRAUD', copy: 'Fraud increasingly operates across platforms, industries and national borders.' },
  { title: 'DISINFORMATION', copy: 'False or manipulated information can influence public perception before institutions have time to respond.' },
  { title: 'CYBERSECURITY & DATA BREACHES', copy: 'A technology incident can quickly become a customer-trust and corporate-reputation crisis.' },
  { title: 'CROSS-BORDER REPUTATION CRISIS', copy: 'A problem originating in one country can affect customers, investors, tourists and stakeholders elsewhere.' },
  { title: 'AI & INSTITUTIONAL TRUST', copy: 'As organisations increasingly use AI, questions of privacy, accountability, transparency and responsible AI become reputation issues.' }
]

export const CONNECTIONS: EditorialRow[] = [
  { title: 'MORE CONNECTIVITY', copy: 'Business • Investment • Tourism • Digital Payments • Data • AI • Social Media' },
  { title: 'MORE OPPORTUNITY', copy: 'Trade • Growth • Innovation • Collaboration • Investment • Mobility' },
  { title: 'MORE REPUTATION RISK', copy: 'Deepfake • Scam • Cyberattack • Disinformation • Impersonation • Data Breach' }
]

export const LEADERS = [
  'Government Leaders, who manage public trust.',
  'Business Leaders, who depend on customer and investor confidence.',
  'Communication & Corporate Affairs Leaders, who manage reputation and stakeholder relationships.',
  'Technology & Data Leaders, who understand emerging digital risks.',
  'Academics & Researchers, who help transform experience into knowledge.'
]

export const SCENARIOS = [
  {
    title: 'A CITY',
    image: '/landing/city.webp',
    alt: 'City setting',
    copy: [
      'Imagine an AI-generated video appearing to show a mayor announcing a policy that was never made.',
      'Within hours it spreads through social media and messaging platforms.',
      'Who verifies the information? Who responds? How quickly? How does the city protect public confidence?'
    ]
  },
  {
    title: 'A BUSINESS',
    image: '/landing/business.webp',
    alt: 'Business district',
    copy: [
      'Imagine a deepfake video or cloned executive voice being used to promote a fraudulent investment or transaction.',
      'The problem is no longer only cybersecurity.',
      'It becomes: Customer Protection × Corporate Communication × Crisis Management × Reputation.'
    ]
  },
  {
    title: 'A DESTINATION',
    image: '/landing/city.webp',
    alt: 'Destination heritage',
    copy: [
      'Imagine misleading information about safety at a tourism destination spreading across several ASEAN markets immediately before a major holiday period.',
      'The impact could move rapidly from social media to: Tourist Confidence → Bookings → Local Economy → Destination Reputation.'
    ]
  }
]

export const FRAMEWORK = [
  { title: '01 — BUILD TRUST', items: ['Leadership', 'Governance', 'Public Communication', 'Stakeholder Engagement', 'Institutional Performance'] },
  { title: '02 — CREATE VALUE', items: ['Business Confidence', 'Investment', 'Tourism', 'Collaboration', 'Economic Growth'] },
  { title: '03 — PROTECT TRUST', items: ['AI Governance', 'Cyber Resilience', 'Crisis Communication', 'Disinformation Response', 'Reputation Management'] }
]

export const PROGRAMME: ProgrammeDay[] = [
  {
    id: 'day1',
    date: 'DAY 1 — 2 DECEMBER 2026',
    question: 'HOW DO WE BUILD TRUST?',
    name: 'SUMATRA PUBLIC COMMUNICATION & REPUTATION FORUM',
    theme: 'WHERE TRUST IS BUILT — SUMATRA',
    summary: 'FROM SUMATRA TO ASEAN: Building Trusted Leadership, Strong Institutions and Regional Reputation',
    rows: [
      { time: '12.00–13.30', title: 'Registration & Social Networking' },
      { time: '13.30–13.45', title: 'Opening Ceremony', details: ['Cultural Opening + Indonesia Raya + ASEAN visual opening.'] },
      { time: '13.45–13.50', title: 'Welcome to APCR' },
      { time: '13.50–14.00', title: 'Academic Welcome' },
      { time: '14.00–14.20', title: 'Opening Address' },
      { time: '14.20–15.00', title: 'APCR SPECIAL POLICY DIALOGUE', details: ['Trust Across Borders'] },
      { time: '15.00–16.00', title: 'SUMATRA – ASEAN Leadership Dialogue: LEADING WITH TRUST', details: ['How Regional Leaders Manage Cities with Public Trust & Reputation'] },
      { time: '16.00–17.00', title: 'SUMATRA – ASEAN Regional Institution & BUMD Transformation Dialogue', details: ['From Public Institution to Trusted Institution'] },
      { time: '17.00–18.00', title: 'SUMATRA – ASEAN Investment, Public Communication, and Destination Dialogue', details: ['What Can Sumatra Bring to ASEAN?'] },
      { time: '18.00–18.10', title: 'Closing Forum + Photo Session' },
      { time: '18.10–18.25', title: 'Afternoon Tea & Networking' }
    ]
  },
  {
    id: 'day2',
    date: 'DAY 2 — 3 DECEMBER 2026',
    question: 'HOW DOES TRUST CREATE VALUE?',
    name: 'ASEAN BUSINESS, TRUST & REPUTATION SUMMIT',
    theme: 'WHERE TRUST CREATES VALUE — ASEAN BUSINESS',
    summary: 'Business Beyond Borders: Building Growth, Trust and Reputation Across ASEAN',
    rows: [
      { time: '08.00–09.00', title: 'Registration & ASEAN Networking Coffee', details: ['Indonesia × Malaysia × Thailand × Singapore'] },
      { time: '09.00–09.05', title: 'Opening by MC' },
      { time: '09.05–09.20', title: 'Opening Address' },
      { time: '09.20–09.50', title: 'Welcome Remarks and Keynote Speech' },
      { time: '09.50–10.30', title: 'ASEAN Keynote Dialogue:', details: ['The Future of Trust, Business and Public Communication in ASEAN'] },
      { time: '10.30–11.40', title: 'ASEAN Strategic Dialogue #1:', details: ['POWERING ASEAN', 'Energy Security, Transition & Sustainable Growth'] },
      { time: '11.40–12.50', title: 'ASEAN Strategic Dialogue #2:', details: ['FINANCING ASEAN GROWTH', 'Financial Connectivity, Inclusion & Cross-Border Investment'] },
      { time: '12.50–13.30', title: 'ASEAN Business Networking Lunch' },
      { time: '13.30–15.00', title: 'ASEAN STRATEGIC DIALOGUE #3', details: ['CONNECTING ASEAN', 'Infrastructure, Public Transportation, Aviation & Destination Economy'] },
      { time: '15.00–16.15', title: 'ASEAN STRATEGIC DIALOGUE #4', details: ['THE FUTURE ASEAN ECONOMY', 'Food Security, Digital Connectivity & AI'] },
      { time: '16.15–16.25', title: 'Day 2 Closing.', details: ['APCR ASEAN Business & Trust Takeaways.'] },
      {
        time: '16.25–19.25',
        title: 'APCR Medan Cultural Experience',
        details: [
          'Discover Medan: A City Built by Diversity',
          'Understanding how culture, migration, commerce and diversity have shaped the identity and reputation of Medan',
          'Destination: Maimun Palace • Heritage Medan/Kesawan • Culinary Medan.'
        ]
      }
    ]
  },
  {
    id: 'day3',
    date: 'DAY 3 — 4 DECEMBER 2026',
    question: 'HOW DO WE PROTECT TRUST?',
    name: 'ASEAN KNOWLEDGE, TRUST & REPUTATION FORUM',
    theme: 'HOW TRUST IS BUILT — COMMUNICATION, REPUTATION & KNOWLEDGE',
    summary: 'Building the Science of Trust & Reputation. From Communication to Trust. From Trust to Business Reputation.',
    rows: [
      { time: '08.30–09.00', title: 'ASEAN Knowledge Networking' },
      { time: '09.00–09.05', title: 'Opening MC' },
      { time: '09.05–09.30', title: 'ACADEMIC KEYNOTE — THE FUTURE OF TRUST IN ASEAN:', details: ['Why Communication, Knowledge and Institutions Matter'] },
      { time: '09.30–10.30', title: 'ASEAN Knowledge Dialogue #1', details: ['CAN WE STILL TRUST WHAT WE SEE?', 'Public Communication, AI, Disinformation Crisis Reputation, & The Future of Trust'] },
      { time: '10.30–10.45', title: 'Coffee Break' },
      {
        time: '10.45–11.45',
        title: 'ASEAN Knowledge Dialogue #2',
        details: ['CAN TRUST BE MEASURED?', 'Towards an ASEAN Framework for Trust & Reputation'],
        issues: ['What is trust?', 'What drives reputation?', 'Can institutional trust be measured?', 'What should an ASEAN Trust & Reputation framework look like?']
      },
      { time: '11.45–13.30', title: 'Academic–Industry Networking Lunch' },
      {
        time: '13.30–14.40',
        title: 'APCR Knowledge Forum',
        details: [
          'CAN TRUST BE MEASURED?',
          'Measuring Public Trust, Institutional Reputation & Stakeholder Confidence in ASEAN',
          'Introduction of APCR RESEARCH & OUTLOOK 2027 as an embryo of APCR intellectual property.'
        ]
      },
      {
        time: '14.40–15.40',
        title: 'FUTURE ASEAN LEADERS DIALOGUE',
        details: ['WHO WILL BUILD ASEAN\'S NEXT GENERATION OF TRUST?'],
        issues: ['Next Generation ASEAN.', 'Communication Leaders.', 'Academic–Industry Collaboration.']
      },
      { time: '15.40–16.00', title: 'Coffee Break' },
      { time: '16.00–17.45', title: 'APCR AWARDS ON TRUST & REPUTATION LEADERSHIP', details: ['Based on data + research + expert panel.'], group: true },
      { time: '16.00–16.10', title: 'Cultural Opening Performance' },
      { time: '16.10–16.15', title: 'Welcome Remarks' },
      { time: '16.15–16.25', title: 'Academic Home: Why Trust Matters for ASEAN' },
      {
        time: '16.25–17.45',
        title: 'APCR Trust & Reputation Leadership Recognition',
        details: ['Recognition categories:'],
        issues: [
          'ASEAN Trust Leadership.',
          'Public Communication Leadership.',
          'Corporate Reputation Leadership.',
          'Cross-Border Collaboration Leadership.',
          'Communication Innovation.',
          'Destination Reputation Leadership.',
          'Next Generation Communication Leadership.',
          'Lifetime Contribution to ASEAN Communication & Reputation.'
        ]
      },
      { time: '17.45–18.00', title: 'Closing: Building the ASEAN Trust Ecosystem' }
    ]
  }
]

export const OUTPUTS: EditorialRow[] = [
  { title: 'APCR Research & Outlook.', copy: 'Research and insights on emerging trust and reputation issues.' },
  { title: 'ASEAN Trust & Reputation Framework', copy: 'Exploring common approaches to understanding and measuring institutional trust.' },
  { title: 'ASEAN Trust Room', copy: 'Focused conversations around emerging reputation and communication challenges.' },
  { title: 'Executive Education', copy: 'Learning programmes for communication, corporate affairs and institutional leaders.' },
  { title: 'Academic–Industry Collaboration', copy: 'Connecting research with real-world institutional challenges.' },
  { title: 'ASEAN Professional Network', copy: 'Connecting leaders and professionals beyond the annual forum.' }
]

export const AUDIENCE: EditorialRow[] = [
  { title: 'GOVERNMENT', copy: 'Governors • Mayors • Public Institutions • Policymakers • Government Communication Leaders' },
  { title: 'BUSINESS', copy: 'CEOs • Directors • Corporate Affairs • Public Affairs • Sustainability • Business Strategy' },
  { title: 'COMMUNICATION', copy: 'Corporate Communication • Public Relations • Reputation • Crisis Communication • Stakeholder Engagement' },
  { title: 'TECHNOLOGY', copy: 'AI • Digital Platforms • Data • Cybersecurity • Digital Infrastructure' },
  { title: 'KNOWLEDGE', copy: 'Universities • Researchers • Academics • Think Tanks' },
  { title: 'NEXT GENERATION', copy: 'Future Communication Leaders • Young Professionals • Students' }
]

export const MEDIA_PARTNERS = [
  { name: 'Sumut Pos', logo: '/landing/sumut-pos.jpg' },
  { name: 'MATA net', logo: '/landing/matanet.jpg' },
  { name: 'Sumut24.co', logo: '/landing/sumut24.jpg' }
]

export const WHATSAPP_URL = 'https://wa.me/6285161274620'
