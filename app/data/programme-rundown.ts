/**
 * The session-level rundown for APCR 2026, as published on apcrforum.com.
 * The home page shows it as the three-day journey. Speakers are still being invited.
 */

export interface RundownRow {
  time: string
  title: string
  details?: string[]
  issues?: string[]
  /** The "Format / Speakers" column; empty shows a dash. */
  speakers?: string[]
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
      { time: '12.00–13.30', title: 'Registration & Social Networking', speakers: ['All delegates from around Sumatra and beyond.'] },
      { time: '13.30–13.45', title: 'Opening Ceremony', details: ['Cultural Opening + Indonesia Raya + ASEAN visual opening.'] },
      { time: '13.45–13.50', title: 'Welcome to APCR', speakers: ['Founder & CEO PR INDONESIA / Initiator APCR.'] },
      { time: '13.50–14.00', title: 'Academic Welcome' },
      { time: '14.00–14.20', title: 'Opening Address', speakers: ['Mayor of Medan, Rico Tri Putra Bayu Waas.'] },
      {
        time: '14.20–15.00',
        title: 'APCR SPECIAL POLICY DIALOGUE',
        details: ['Trust Across Borders'],
        speakers: [
          'Yasonna H. Laoly, Member of Commission XIII, House of Representatives of the Republic of Indonesia.',
          'Agus Andrianto, Minister of Immigration and Corrections, Republic of Indonesia.'
        ]
      },
      {
        time: '15.00–16.00',
        title: 'SUMATRA – ASEAN Leadership Dialogue: LEADING WITH TRUST',
        details: ['How Regional Leaders Manage Cities with Public Trust & Reputation'],
        speakers: [
          'Mayor of Banda Aceh, Hj. Illiza Sa\'aduddin Djamal, S.E.',
          'Mayor of Medan, Rico Tri Putra Bayu Waas.',
          'Mayor of Batam / Head of BP Batam, H. Amsakar Achmad.',
          'Mayor of Bandar Lampung, Hj. Eva Dwiana.'
        ]
      },
      {
        time: '16.00–16.20',
        title: 'APCR Special Institutional Address:',
        details: ['THE RULE OF LAW AND THE FUTURE OF PUBLIC TRUST', 'Building Credible Institutions in an Era of Disruption'],
        speakers: ['Head of the Medan State Administrative High Court (PT TUN Medan), Dr. Disiplin F. Manao, S.H., M.H.']
      },
      {
        time: '16.20–17.20',
        title: 'SUMATRA – ASEAN Regional Institution & BUMD Transformation Dialogue',
        details: ['From Public Institution to Trusted Institution'],
        speakers: [
          'Director of Operations and Institutional Relations PNM, Lalu Dodot Patria Ary.',
          'CEO Bank Sumut, Dr. Heru Mardiansyah, S.Si., M.Kom.',
          'CEO Bank Riau Kepri Syariah, Helwin Yunus.',
          'CEO Perumda Tirtanadi, Ardian Surbakti.'
        ]
      },
      {
        time: '17.20–18.10',
        title: 'SUMATRA – ASEAN Investment, Public Communication, and Destination Dialogue',
        details: ['What Can Sumatra Bring to ASEAN?'],
        speakers: [
          'Chairman of the Indonesian Chamber of Commerce and Industry (KADIN) North Sumatra, Firsal Dida Mutyara.',
          'CEO Lake Toba Authority Implementing Agency (BPODT), Arditama Nusantara Putra.',
          'Head of the Communication and Informatics Office North Sumatra, Dr. Erwin Hotmansyah Harahap, S.STP.'
        ]
      },
      { time: '18.10–18.15', title: 'Closing Forum + Photo Session' },
      { time: '18.15–18.30', title: 'Afternoon Tea & Networking' }
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
      { time: '09.05–09.20', title: 'Opening Address', speakers: ['Governor of North Sumatra, Bobby Nasution.'] },
      { time: '09.20–10.00', title: 'Welcome Remarks and Keynote Speech', speakers: ['President of the Republic of Indonesia.', 'Secretary-General of ASEAN.'] },
      {
        time: '10.00–10.25',
        title: 'ASEAN Keynote Dialogue:',
        details: ['The Future of Trust, Business and Public Communication in ASEAN'],
        speakers: ['Mrs Prita Kemal Gani, Chairman of ASEAN PR Network (APRN).']
      },
      {
        time: '10.25–10.50',
        title: 'APCR SPECIAL GLOBAL PERSPECTIVE: ASEAN BEYOND ASEAN',
        details: ['Building Trust, Business and Partnerships Across the Indian Ocean'],
        speakers: ['Special Envoy of Seychelles for ASEAN, H.E. Nico Barito.']
      },
      {
        time: '10.50–11.50',
        title: 'ASEAN Strategic Dialogue #1:',
        details: ['POWERING ASEAN', 'Energy Security, Transition & Sustainable Growth'],
        speakers: ['CEO Pertamina.', 'CEO PETRONAS.', 'CEO Banpu.', 'CEO Bukit Asam.']
      },
      {
        time: '11.50–12.50',
        title: 'ASEAN Strategic Dialogue #2:',
        details: ['FINANCING ASEAN GROWTH', 'Financial Connectivity, Inclusion & Cross-Border Investment'],
        speakers: ['CEO Bank BNI.', 'CEO Maybank.', 'CEO Bangkok Bank / Permata Bank.', 'CEO DBS Bank.']
      },
      { time: '12.50–13.30', title: 'ASEAN Business Networking Lunch', speakers: ['CEO / Corporate Affairs / Public Affairs tables.'] },
      {
        time: '13.30–15.00',
        title: 'ASEAN STRATEGIC DIALOGUE #3',
        details: ['CONNECTING ASEAN', 'Infrastructure, Public Transportation, Aviation & Destination Economy'],
        speakers: [
          'Coordinating Minister for Infrastructure and Regional Development of the Republic of Indonesia, Mr Agus Harimurti Yudhoyono.',
          'CEO Hutama Karya.',
          'CEO Blue Bird.',
          'CEO Garuda Indonesia.',
          'CEO Singapore Airlines.',
          'CEO Malaysia Airlines.',
          'CEO MRT Jakarta.'
        ]
      },
      {
        time: '15.00–16.15',
        title: 'ASEAN STRATEGIC DIALOGUE #4',
        details: ['THE FUTURE ASEAN ECONOMY', 'Food Security, Digital Connectivity & AI'],
        speakers: [
          'Deputy for Promotion and Cooperation, National Nutrition Agency (BGN), Dr. Mariman Darto.',
          'CEO PTPN I.',
          'CEO Telkomsel.',
          'CEO Axiata.'
        ]
      },
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
      {
        time: '09.05–09.30',
        title: 'ACADEMIC KEYNOTE — THE FUTURE OF TRUST IN ASEAN:',
        details: ['Why Communication, Knowledge and Institutions Matter'],
        speakers: ['Rector of UMSU, Medan.']
      },
      {
        time: '09.30–10.30',
        title: 'ASEAN Knowledge Dialogue #1',
        details: ['CAN WE STILL TRUST WHAT WE SEE?', 'Public Communication, AI, Disinformation, Crisis Reputation & The Future of Trust'],
        speakers: [
          'Academician from Malaysia / Singapore.',
          'CEO NoLimit, Aqsath Rasyid Naradhipa.',
          'Academician from UMSU.',
          'Mrs Anne Purba, VP Corporate Communication KAI.'
        ]
      },
      { time: '10.30–10.45', title: 'Coffee Break' },
      {
        time: '10.45–11.45',
        title: 'ASEAN Knowledge Dialogue #2 — APCR Knowledge Forum',
        details: [
          'CAN TRUST BE MEASURED?',
          'Measuring Public Trust, Institutional Reputation & Stakeholder Confidence in ASEAN',
          'Introduction of APCR RESEARCH & OUTLOOK 2027 as an embryo of APCR intellectual property.'
        ],
        speakers: [
          'Academician from USU.',
          'PR INDONESIA.',
          'Academician from Malaysia / Thailand.',
          'VP Corporate Communication PTPN III.'
        ]
      },
      { time: '11.45–14.00', title: 'Academic–Industry Networking Lunch' },
      { time: '14.00–16.45', title: 'APCR AWARDS ON TRUST & REPUTATION LEADERSHIP', details: ['Based on data + research + expert panel.'], group: true },
      { time: '14.00–14.10', title: 'Cultural Opening Performance' },
      { time: '14.10–14.15', title: 'Welcome Remarks', speakers: ['Founder & CEO PR INDONESIA / Initiator APCR.'] },
      { time: '14.15–14.30', title: 'Academic Home: Why Trust Matters for ASEAN', speakers: ['Rector of UMSU, Medan.'] },
      {
        time: '14.30–16.00',
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
      { time: '16.00–16.15', title: 'Closing: Building the ASEAN Trust Ecosystem' }
    ]
  }
]
