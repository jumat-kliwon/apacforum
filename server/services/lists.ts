import { and, asc, desc, eq, gte, ilike, inArray, lt, or, sql, type SQL } from 'drizzle-orm'
import type { z } from 'zod'
import type { participantListQuery, transactionListQuery } from '../../shared/schemas/participant'
import { db } from '../db'
import { events, participants, ticketTypes, transactions, users } from '../db/schema'
import { likePattern } from '../utils/validate'

type PQuery = z.output<typeof participantListQuery>
type TQuery = z.output<typeof transactionListQuery>

const participantSort = {
  name: users.name,
  type: ticketTypes.name,
  org: users.organization,
  reg: participants.status,
  pay: participants.paymentStatus,
  date: participants.createdAt
} as const

function participantWhere(q: Omit<PQuery, 'page' | 'pageSize' | 'sort' | 'dir'>) {
  const conds: (SQL | undefined)[] = []
  if (q.q) {
    const p = likePattern(q.q)
    conds.push(or(ilike(users.name, p), ilike(sql`${users.email}::text`, p), ilike(users.organization, p), ilike(participants.regNo, p)))
  }
  conds.push(eq(participants.eventId, q.eventId))
  if (q.ticketTypeName) conds.push(eq(ticketTypes.name, q.ticketTypeName))
  if (q.status) conds.push(eq(participants.status, q.status))
  if (q.paymentStatus) conds.push(eq(participants.paymentStatus, q.paymentStatus))
  return and(...conds)
}

const participantSelect = {
  id: participants.id,
  regNo: participants.regNo,
  userId: users.id,
  name: users.name,
  email: users.email,
  phone: users.phone,
  organization: users.organization,
  jobTitle: users.jobTitle,
  country: users.country,
  eventId: events.id,
  eventName: events.name,
  ticketTypeName: ticketTypes.name,
  status: participants.status,
  paymentStatus: participants.paymentStatus,
  ticketCode: participants.ticketCode,
  createdAt: participants.createdAt
}

const participantBase = () => db.select(participantSelect).from(participants)
  .innerJoin(users, eq(users.id, participants.userId))
  .innerJoin(events, eq(events.id, participants.eventId))
  .innerJoin(ticketTypes, eq(ticketTypes.id, participants.ticketTypeId))

export async function listParticipants(q: PQuery) {
  const where = participantWhere(q)
  const order = q.dir === 'asc' ? asc(participantSort[q.sort]) : desc(participantSort[q.sort])
  const [rows, [count]] = await Promise.all([
    participantBase().where(where).orderBy(order, desc(participants.id)).limit(q.pageSize).offset((q.page - 1) * q.pageSize),
    db.select({ n: sql<number>`count(*)::int` }).from(participants)
      .innerJoin(users, eq(users.id, participants.userId))
      .innerJoin(ticketTypes, eq(ticketTypes.id, participants.ticketTypeId))
      .where(where)
  ])
  return { rows, total: count?.n ?? 0 }
}

export function exportParticipants(q: PQuery, ids?: string[]) {
  const where = and(participantWhere(q), ids?.length ? inArray(participants.id, ids) : undefined)
  return participantBase().where(where).orderBy(desc(participants.createdAt)).limit(50_000)
}

const transactionSort = {
  id: transactions.invoiceNo,
  name: transactions.participantName,
  type: transactions.ticketTypeName,
  amount: transactions.total,
  method: transactions.method,
  status: transactions.status,
  date: transactions.createdAt
} as const

function transactionWhere(q: TQuery) {
  const conds: (SQL | undefined)[] = []
  if (q.q) {
    const p = likePattern(q.q)
    conds.push(or(ilike(transactions.invoiceNo, p), ilike(transactions.participantName, p), ilike(transactions.participantEmail, p)))
  }
  conds.push(eq(transactions.eventId, q.eventId))
  if (q.status) conds.push(eq(transactions.status, q.status))
  if (q.method) conds.push(eq(transactions.method, q.method))
  if (q.from) conds.push(gte(transactions.createdAt, new Date(`${q.from}T00:00:00+07:00`)))
  if (q.to) conds.push(lt(transactions.createdAt, new Date(new Date(`${q.to}T00:00:00+07:00`).getTime() + 86_400_000)))
  return and(...conds)
}

const transactionSelect = {
  id: transactions.id,
  invoiceNo: transactions.invoiceNo,
  userId: transactions.userId,
  participantName: transactions.participantName,
  participantEmail: transactions.participantEmail,
  eventName: transactions.eventName,
  ticketTypeName: transactions.ticketTypeName,
  total: transactions.total,
  method: transactions.method,
  channel: sql<string | null>`${transactions.payment}->>'channel'`,
  status: transactions.status,
  createdAt: transactions.createdAt,
  paidAt: transactions.paidAt
}

export async function listTransactions(q: TQuery) {
  const where = transactionWhere(q)
  const order = q.dir === 'asc' ? asc(transactionSort[q.sort]) : desc(transactionSort[q.sort])
  const [rows, [count]] = await Promise.all([
    db.select(transactionSelect).from(transactions).where(where).orderBy(order, desc(transactions.id)).limit(q.pageSize).offset((q.page - 1) * q.pageSize),
    db.select({ total: sql<number>`count(*)::int` }).from(transactions).where(where)
  ])
  return { rows, total: count?.total ?? 0 }
}

export function exportTransactions(q: TQuery, ids?: string[]) {
  const where = and(transactionWhere(q), ids?.length ? inArray(transactions.id, ids) : undefined)
  return db.select(transactionSelect).from(transactions).where(where).orderBy(desc(transactions.createdAt)).limit(50_000)
}
