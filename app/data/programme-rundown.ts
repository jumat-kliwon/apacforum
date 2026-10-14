/**
 * The session-level rundown for APCR 2026.
 *
 * Not yet surfaced anywhere: the `apcr-2026-page` design publishes confirmed
 * tracks only, and says the hour-by-hour agenda follows "progressively from
 * October 2026". Kept here so that detail is not lost when it is needed.
 */

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
