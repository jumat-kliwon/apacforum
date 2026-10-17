/**
 * Seed: admin account + sample data from the APCR CMS design.
 * Deletes ALL events, participants and transactions, then fills them again.
 *
 *   bun run db:seed
 *
 * On Vercel it only runs when the `RUN_SEED=1` env var is set (see `vercel.json`);
 * turn it off right after, or every deploy wipes the data again.
 */
import { eq } from 'drizzle-orm'
import type { TransactionHistory, TransactionItems, TransactionPayment } from '../../shared/schemas/transaction'
import { formatInvoiceNo, formatRegNo, formatTicketCode } from '../../shared/utils/numbering'
import { auth } from '../utils/auth'
import { client, db } from './index'
import * as s from './schema'

if (process.env.NODE_ENV === 'production' && process.env.RUN_SEED !== '1') {
  throw new Error('Refusing to seed a production database (set RUN_SEED=1 to override)')
}

// SEED_ADMIN_* locally; on Vercel the admin created by db:bootstrap (ADMIN_*) is reused
const adminEmail = (process.env.SEED_ADMIN_EMAIL || process.env.ADMIN_EMAIL)?.trim().toLowerCase()
const adminPassword = process.env.SEED_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD
const adminName = process.env.SEED_ADMIN_NAME || process.env.ADMIN_NAME || 'APCR Admin'
if (!adminEmail || !adminPassword) {
  throw new Error('SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD (or ADMIN_EMAIL/ADMIN_PASSWORD) must be set')
}

/** WIB local time → Date. */
const wib = (isoLocal: string) => new Date(`${isoLocal}+07:00`)

await db.transaction(async (tx) => {
  // ── reset ─────────────────────────────────────────────────────────
  await tx.delete(s.transactions)
  await tx.delete(s.events) // cascades to agenda, speakers, partners, tickets, participants
  await tx.delete(s.users).where(eq(s.users.role, 'participant'))

  // ── admin ─────────────────────────────────────────────────────────
  const ctx = await auth.$context
  const [existingAdmin] = await tx.select().from(s.users).where(eq(s.users.email, adminEmail))
  let admin = existingAdmin
  if (!admin) {
    ;[admin] = await tx.insert(s.users).values({
      name: adminName,
      email: adminEmail,
      emailVerified: true,
      role: 'superadmin'
    }).returning()
    await tx.insert(s.accounts).values({
      accountId: admin!.id,
      providerId: 'credential',
      userId: admin!.id,
      password: await ctx.password.hash(adminPassword)
    })
  }
  const adminRef = { id: admin!.id, name: admin!.name }

  // ── events ────────────────────────────────────────────────────────
  const [apcr, pre, atr] = await tx.insert(s.events).values([
    {
      code: 'APCR',
      slug: 'apcr-2026',
      name: 'APCR 2026',
      tagline: 'Building Trust. Shaping Reputation. Connecting ASEAN.',
      description: 'The ASEAN Public Communication & Reputation Forum (APCR) 2026 brings together government, business, academic and communication leaders from across ASEAN for three days in Medan to discuss public trust, reputation and communication in the age of AI.',
      startDate: '2026-12-02',
      endDate: '2026-12-04',
      registrationDeadline: wib('2026-11-25T23:59:00'),
      venueName: 'Santika Premiere Dyandra',
      venueAddress: 'Jl. Kapten Maulana Lubis No. 7, Medan',
      city: 'Medan',
      capacity: 1450,
      status: 'published',
      publishedAt: wib('2026-09-01T09:00:00'),
      createdBy: adminRef.id
    },
    {
      code: 'PRE',
      slug: 'apcr-pre-forum-jakarta',
      name: 'APCR Pre-Forum Jakarta',
      tagline: 'Road to APCR 2026: Reputation in the Age of AI',
      startDate: '2026-11-06',
      endDate: '2026-11-06',
      registrationDeadline: wib('2026-11-01T23:59:00'),
      venueName: 'Hotel Aryaduta Menteng',
      city: 'Jakarta',
      capacity: 300,
      status: 'published',
      publishedAt: wib('2026-09-15T09:00:00'),
      createdBy: adminRef.id
    },
    {
      code: 'ATR',
      slug: 'asean-trust-room-roundtable',
      name: 'ASEAN Trust Room Roundtable',
      tagline: 'A closed-door dialogue for public communication leaders',
      startDate: '2027-01-21',
      endDate: '2027-01-21',
      registrationDeadline: wib('2027-01-14T23:59:00'),
      venueName: '[Venue to be confirmed]',
      city: 'Kuala Lumpur',
      capacity: 40,
      status: 'draft',
      createdBy: adminRef.id
    }
  ]).returning()

  const days = await tx.insert(s.agendaDays).values([
    { eventId: apcr!.id, sortOrder: 1, label: 'SUMATRA', date: '2026-12-02', theme: 'Building Trust from the Regions. Sumatra toward ASEAN Bridge.', body: 'Leadership, city and regional reputation, public institutions, regional state-owned enterprises, destination reputation, public communication.' },
    { eventId: apcr!.id, sortOrder: 2, label: 'ASEAN BUSINESS', date: '2026-12-03', theme: 'Turning Trust into Economic Value.', body: 'ASEAN Cross-Border Business & Leaders Dialogue • Energy & Transition • Financial Inclusion • Infrastructure & Public Transportation • Food Security & Halal Economy • Aviation & Tourism • Sustainable Industry • Telecommunication & Digital • Big Data & AI.' },
    { eventId: apcr!.id, sortOrder: 3, label: 'ASEAN KNOWLEDGE', date: '2026-12-04', theme: 'Building the Science of Trust & Reputation', body: 'Public trust, AI and disinformation, crisis and leadership, reputation, research, measurement, talent development, academic–industry collaboration.' }
  ]).returning()

  await tx.insert(s.speakers).values([
    { eventId: apcr!.id, agendaDayId: days[0]!.id, name: 'Dr. Hendra Siregar', title: 'Head of Public Communications Bureau, North Sumatra Provincial Government', category: 'government', status: 'published', sortOrder: 1 },
    { eventId: apcr!.id, agendaDayId: days[1]!.id, name: 'Lim Pei Shan', title: 'Chief Communications Officer, Straits Capital Group', category: 'business', status: 'published', sortOrder: 2 },
    { eventId: apcr!.id, agendaDayId: days[2]!.id, name: 'Prof. Ayu Wulandari', title: 'Professor of Communication, Universitas Nusantara', category: 'academia', status: 'draft', sortOrder: 3 },
    { eventId: apcr!.id, agendaDayId: days[0]!.id, name: 'Thanawat Rattanakul', title: 'Director of Public Affairs, Bangkok Media Council', category: 'communication', status: 'published', sortOrder: 4 }
  ])

  await tx.insert(s.partners).values([
    { eventId: apcr!.id, name: 'Universitas Nusantara Medan', category: 'academic_home', sortOrder: 1 },
    { eventId: apcr!.id, name: 'North Sumatra Provincial Government', category: 'government_regional', sortOrder: 2 },
    { eventId: apcr!.id, name: 'ASEAN Communication Network', category: 'strategic', sortOrder: 3 },
    { eventId: apcr!.id, name: 'PT Sumatra Energi Nusantara', category: 'business_industry', sortOrder: 4 },
    { eventId: apcr!.id, name: 'Trust & Reputation Lab', category: 'knowledge_research', sortOrder: 5 },
    { eventId: apcr!.id, name: 'Datakita.ai', category: 'technology', sortOrder: 6 },
    { eventId: apcr!.id, name: 'Medan Media Group', category: 'media', sortOrder: 7 }
  ])

  const tickets = await tx.insert(s.ticketTypes).values([
    { eventId: apcr!.id, code: 'ID', name: 'Indonesia Delegate', price: 2_500_000, quota: 800, sortOrder: 1 },
    { eventId: apcr!.id, code: 'INT', name: 'ASEAN/International Delegate', price: 4_750_000, quota: 450, sortOrder: 2 },
    { eventId: apcr!.id, code: 'CORP', name: 'Corporate Delegation', price: 15_000_000, paxPerTicket: 5, quota: 200, sortOrder: 3 },
    { eventId: pre!.id, code: 'ID', name: 'Indonesia Delegate', price: 1_500_000, quota: 250, sortOrder: 1 },
    { eventId: pre!.id, code: 'CORP', name: 'Corporate Delegation', price: 12_000_000, paxPerTicket: 5, quota: 50, sortOrder: 2 },
    { eventId: atr!.id, code: 'ID', name: 'Indonesia Delegate', price: 750_000, quota: 40, sortOrder: 1 }
  ]).returning()
  const ticket = (event: typeof apcr, code: string) => tickets.find(t => t.eventId === event!.id && t.code === code)!

  // ── participants + transactions ───────────────────────────────────
  type Pay = 'paid' | 'pending' | 'expired' | 'refunded' | null
  type Row = {
    user: string, event: typeof apcr, ticket: string, regSeq: number, invSeq?: number,
    reg: 'pending_verification' | 'verified' | 'rejected' | 'cancelled', pay: Pay,
    at: string, paidAt?: string, method?: 'virtual_account' | 'qris' | 'credit_card' | 'bank_transfer', channel?: string,
    ticketSeq?: number
  }

  const people: Record<string, typeof s.users.$inferInsert> = {
    dimas: { name: 'Dimas Saputra', email: 'dimas.saputra@pemkomedan.go.id', phone: '+6281260341187', organization: 'Medan City Government', jobTitle: 'Head of Protocol and Leadership Communications', country: 'ID', city: 'Medan', tshirtSize: 'L', mealPreference: 'Halal', referralSource: 'Institutional invitation', createdAt: wib('2026-09-28T10:00:00') },
    nguyen: { name: 'Nguyen Thi Lan', email: 'lan.nguyen@vci.edu.vn', organization: 'Vietnam Communication Institute', country: 'VN' },
    ahmad: { name: 'Ahmad Hidayat', email: 'ahmad.h@sumatraenergi.co.id', organization: 'PT Sumatra Energi Nusantara', country: 'ID', city: 'Medan' },
    maria: { name: 'Maria Santos', email: 'm.santos@manilapao.gov.ph', organization: 'Manila Public Affairs Office', country: 'PH', city: 'Manila' },
    putri: { name: 'Putri Lestari', email: 'putri.lestari@unandraya.ac.id', organization: 'Universitas Andalas Raya', country: 'ID' },
    wan: { name: 'Wan Khairul Anuar', email: 'khairul@kl-reputation.my', organization: 'KL Reputation Advisory', country: 'MY', city: 'Kuala Lumpur' },
    siti: { name: 'Siti Rahmawati', email: 'siti.rahma@bankdeltasumut.co.id', organization: 'Bank Delta Sumut', country: 'ID', city: 'Medan' },
    budi: { name: 'Budi Wicaksono', email: 'budi.w@kominfo-sumut.go.id', organization: 'North Sumatra Communications and Informatics Office', country: 'ID', city: 'Medan' },
    rizky: { name: 'Rizky Nasution', email: 'rizky.nasution@usuraya.ac.id', organization: 'Universitas Sumatera Raya', country: 'ID', city: 'Medan' },
    jonathan: { name: 'Jonathan Tan', email: 'jonathan.tan@sgcomms.sg', organization: 'SG Comms Collective', country: 'SG', city: 'Singapore' }
  }
  const insertedUsers = await tx.insert(s.users).values(
    Object.values(people).map(p => ({ ...p, role: 'participant' }))
  ).returning()
  const userByEmail = new Map(insertedUsers.map(u => [u.email, u]))
  const userOf = (key: string) => userByEmail.get(people[key]!.email)!

  const rows: Row[] = [
    { user: 'dimas', event: apcr, ticket: 'ID', regSeq: 1248, invSeq: 1248, reg: 'verified', pay: 'paid', at: '2026-10-10T22:41:00', paidAt: '2026-10-12T09:04:00', method: 'virtual_account', channel: 'BCA', ticketSeq: 712 },
    { user: 'dimas', event: pre, ticket: 'ID', regSeq: 398, invSeq: 398, reg: 'verified', pay: 'paid', at: '2026-10-01T10:00:00', paidAt: '2026-10-02T13:18:00', method: 'qris', ticketSeq: 214 },
    { user: 'dimas', event: atr, ticket: 'ID', regSeq: 91, reg: 'pending_verification', pay: null, at: '2026-10-11T09:00:00' },
    { user: 'nguyen', event: apcr, ticket: 'INT', regSeq: 1247, invSeq: 1247, reg: 'verified', pay: 'pending', at: '2026-10-12T08:31:00' },
    { user: 'ahmad', event: apcr, ticket: 'CORP', regSeq: 1246, invSeq: 1246, reg: 'verified', pay: 'paid', at: '2026-10-12T07:58:00', paidAt: '2026-10-12T08:10:00', method: 'bank_transfer', ticketSeq: 152 },
    { user: 'maria', event: apcr, ticket: 'INT', regSeq: 1245, invSeq: 1245, reg: 'verified', pay: 'pending', at: '2026-10-11T21:14:00' },
    { user: 'putri', event: atr, ticket: 'ID', regSeq: 87, invSeq: 87, reg: 'verified', pay: 'expired', at: '2026-10-11T16:40:00' },
    { user: 'wan', event: apcr, ticket: 'INT', regSeq: 1243, invSeq: 1243, reg: 'verified', pay: 'paid', at: '2026-10-10T14:25:00', paidAt: '2026-10-10T14:27:00', method: 'credit_card', ticketSeq: 384 },
    { user: 'siti', event: pre, ticket: 'CORP', regSeq: 412, invSeq: 412, reg: 'cancelled', pay: 'refunded', at: '2026-10-09T11:02:00', paidAt: '2026-10-09T11:05:00', method: 'virtual_account', channel: 'Mandiri' },
    { user: 'budi', event: pre, ticket: 'ID', regSeq: 411, invSeq: 411, reg: 'verified', pay: 'paid', at: '2026-10-09T10:45:00', paidAt: '2026-10-09T10:48:00', method: 'qris', ticketSeq: 286 },
    { user: 'rizky', event: apcr, ticket: 'ID', regSeq: 1239, invSeq: 1239, reg: 'verified', pay: 'paid', at: '2026-10-08T19:37:00', paidAt: '2026-10-08T19:41:00', method: 'virtual_account', channel: 'BNI', ticketSeq: 711 },
    { user: 'jonathan', event: apcr, ticket: 'INT', regSeq: 1236, invSeq: 1236, reg: 'pending_verification', pay: null, at: '2026-10-08T13:20:00' }
  ]

  for (const r of rows) {
    const user = userOf(r.user)
    const tt = ticket(r.event, r.ticket)
    const event = r.event!
    const createdAt = wib(r.at)
    const verifiedAt = r.reg === 'verified' || r.reg === 'cancelled' ? new Date(createdAt.getTime() + 60 * 60 * 1000) : null
    const paidAt = r.paidAt ? wib(r.paidAt) : null
    const ticketCode = r.ticketSeq ? formatTicketCode(event.code, new Date(event.startDate), tt.code, r.ticketSeq) : null

    const [participant] = await tx.insert(s.participants).values({
      regNo: formatRegNo(event.code, r.regSeq, createdAt),
      userId: user.id,
      eventId: event.id,
      ticketTypeId: tt.id,
      status: r.reg,
      paymentStatus: r.pay ?? 'none',
      verifiedAt,
      verifiedBy: verifiedAt ? adminRef.id : null,
      cancelledAt: r.reg === 'cancelled' ? wib('2026-10-10T09:00:00') : null,
      ticketCode: r.pay === 'paid' ? ticketCode : null,
      ticketIssuedAt: r.pay === 'paid' ? paidAt : null,
      createdAt
    }).returning()

    if (!r.pay || !r.invSeq) continue

    const issuedAt = verifiedAt!
    const expiresAt = new Date(issuedAt.getTime() + 48 * 60 * 60 * 1000)
    const items: TransactionItems = {
      lines: [{ description: `${tt.name} ticket`, note: `${event.name}`, qty: 1, unitPrice: tt.price, subtotal: tt.price }],
      subtotal: tt.price,
      discount: 0
    }
    if (r.method === 'virtual_account' && r.channel === 'BCA') {
      items.lines.push({ description: 'VA service fee', note: 'Covered by the organizers', qty: 1, unitPrice: 4440, subtotal: 0 })
    }
    const payment: TransactionPayment = {
      ...(r.channel && { channel: r.channel }),
      ...(r.pay === 'refunded' && { refundAmount: tt.price, refundedAt: wib('2026-10-10T09:00:00').toISOString(), adminNote: 'Cancellation approved by the organizers.' }),
      ...(r.pay === 'paid' && { adminNote: 'Payment confirmed automatically by DOKU.' })
    }
    const history: TransactionHistory = [
      { type: 'created', at: issuedAt.toISOString(), description: 'by the system after verification', actor: null },
      { type: 'invoice_sent', at: issuedAt.toISOString(), actor: null }
    ]
    if (paidAt) {
      history.push({ type: 'paid', at: paidAt.toISOString(), description: r.channel ? `VA ${r.channel}` : r.method, actor: null })
      if (ticketCode) history.push({ type: 'ticket_sent', at: new Date(paidAt.getTime() + 60_000).toISOString(), description: ticketCode, actor: null })
    }
    if (r.pay === 'expired') history.push({ type: 'expired', at: expiresAt.toISOString(), actor: null })
    if (r.pay === 'refunded') history.push({ type: 'refunded', at: payment.refundedAt!, actor: adminRef })

    await tx.insert(s.transactions).values({
      invoiceNo: formatInvoiceNo(event.code, r.invSeq, issuedAt),
      userId: user.id,
      participantId: participant!.id,
      eventId: event.id,
      participantName: user.name,
      participantEmail: user.email,
      eventName: event.name,
      ticketTypeName: tt.name,
      status: r.pay,
      method: paidAt ? r.method : null,
      total: tt.price,
      expiresAt,
      paidAt,
      items,
      payment,
      history,
      createdAt: issuedAt
    })
  }

  // counters continue from the highest number used by the seed
  const maxBy = (event: typeof apcr, key: 'regSeq' | 'invSeq') =>
    Math.max(0, ...rows.filter(r => r.event === event).map(r => r[key] ?? 0))
  for (const event of [apcr, pre, atr]) {
    await tx.update(s.events)
      .set({ registrationSeq: maxBy(event, 'regSeq'), invoiceSeq: maxBy(event, 'invSeq') })
      .where(eq(s.events.id, event!.id))
  }
  for (const tt of tickets) {
    const max = Math.max(0, ...rows.filter(r => r.event!.id === tt.eventId && r.ticket === tt.code).map(r => r.ticketSeq ?? 0))
    await tx.update(s.ticketTypes).set({ ticketSeq: max }).where(eq(s.ticketTypes.id, tt.id))
  }
})

console.log(`Seed done. Admin login: ${adminEmail}`)
await client.close()
