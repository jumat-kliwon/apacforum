import { and, desc, eq, sql } from 'drizzle-orm'
import * as z from 'zod'
import { db } from '~~/server/db'
import { events, participants, ticketTypes, transactions, users } from '~~/server/db/schema'

const query = z.object({ eventId: z.uuid() })

export default defineEventHandler(async (event) => {
  await requireSuperadmin(event)
  const { eventId } = parseQuery(event, query)

  const [ev] = await db.select({ id: events.id, timezone: events.timezone }).from(events).where(eq(events.id, eventId))
  if (!ev) throw createError({ statusCode: 404, statusMessage: 'Event not found' })

  const byEvent = eq(participants.eventId, ev.id)
  const tz = ev.timezone

  const [stats] = await db.select({
    total: sql<number>`count(*)::int`,
    today: sql<number>`count(*) filter (where (${participants.createdAt} at time zone ${tz})::date = (now() at time zone ${tz})::date)::int`,
    pending: sql<number>`count(*) filter (where ${participants.status} = 'pending_verification')::int`,
    paid: sql<number>`count(*) filter (where ${participants.paymentStatus} = 'paid')::int`
  }).from(participants).where(byEvent)

  const [revenue] = await db.select({ sum: sql<number>`coalesce(sum(${transactions.total}), 0)::bigint` })
    .from(transactions).where(and(eq(transactions.eventId, ev.id), eq(transactions.status, 'paid')))

  const daily = await db.execute<{ day: string, n: number }>(sql`
    select to_char(d, 'YYYY-MM-DD') as day, coalesce(c.n, 0)::int as n
    from generate_series((now() at time zone ${tz})::date - 13, (now() at time zone ${tz})::date, interval '1 day') d
    left join (
      select (created_at at time zone ${tz})::date as day, count(*) as n
      from participants where event_id = ${ev.id} group by 1
    ) c on c.day = d::date
    order by d`)

  const quotas = await db.select({
    name: ticketTypes.name,
    quota: ticketTypes.quota,
    sold: sql<number>`count(${participants.id}) filter (where ${participants.paymentStatus} = 'paid')::int`
  }).from(ticketTypes)
    .leftJoin(participants, eq(participants.ticketTypeId, ticketTypes.id))
    .where(eq(ticketTypes.eventId, ev.id))
    .groupBy(ticketTypes.id)
    .orderBy(ticketTypes.sortOrder)

  const payRows = await db.select({ status: transactions.status, n: sql<number>`count(*)::int` })
    .from(transactions).where(eq(transactions.eventId, ev.id)).groupBy(transactions.status)

  const recent = await db.select({
    id: participants.id,
    userId: users.id,
    name: users.name,
    organization: users.organization,
    ticketTypeName: ticketTypes.name,
    status: participants.status,
    paymentStatus: participants.paymentStatus,
    createdAt: participants.createdAt
  }).from(participants)
    .innerJoin(users, eq(users.id, participants.userId))
    .innerJoin(ticketTypes, eq(ticketTypes.id, participants.ticketTypeId))
    .where(byEvent)
    .orderBy(desc(participants.createdAt))
    .limit(5)

  return {
    stats: { ...stats!, revenue: Number(revenue?.sum ?? 0) },
    daily: [...daily].map(r => ({ day: String(r.day), n: Number(r.n) })),
    quotas,
    payStatus: {
      pending: payRows.find(r => r.status === 'pending')?.n ?? 0,
      paid: payRows.find(r => r.status === 'paid')?.n ?? 0,
      expired: payRows.find(r => r.status === 'expired')?.n ?? 0,
      refunded: payRows.find(r => r.status === 'refunded')?.n ?? 0
    },
    recent
  }
})
