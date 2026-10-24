import { and, between, eq, inArray, isNull } from 'drizzle-orm'
import { db } from '../../db'
import { events, participants } from '../../db/schema'
import { loadMailData } from '../../services/context'
import { sendTemplateSafe } from '../../services/mail/send'

/** WIB date `YYYY-MM-DD` shifted by n days. */
const wibDate = (offsetDays: number) =>
  new Date(Date.now() + 7 * 3600_000 + offsetDays * 86_400_000).toISOString().slice(0, 10)

const SENT_AT = {
  'event-reminder-h3': participants.eventReminderSentAt,
  'event-thank-you': participants.thankYouSentAt
} as const

/**
 * Dates are a range, not a single day, so a missed or late cron run (or a payment made after the
 * 3-day mark) still gets the email; `sentAt` keeps it to one email per participant.
 */
async function notify(dateColumn: typeof events.startDate | typeof events.endDate, from: string, to: string, key: keyof typeof SENT_AT) {
  const sentAt = SENT_AT[key]
  const eventIds = db.select({ id: events.id }).from(events).where(and(between(dateColumn, from, to), eq(events.status, 'published')))
  // claim the rows first, so a second run on the same day (cron + manual trigger) sends nothing
  const rows = await db.update(participants)
    .set(key === 'event-reminder-h3' ? { eventReminderSentAt: new Date() } : { thankYouSentAt: new Date() })
    .where(and(
      inArray(participants.eventId, eventIds),
      eq(participants.status, 'verified'),
      eq(participants.paymentStatus, 'paid'),
      isNull(sentAt)
    ))
    .returning({ id: participants.id })
  for (const r of rows) {
    const data = await loadMailData(r.id)
    if (!data) continue
    const { failed } = await sendTemplateSafe(key, data)
    // release the claim so the next run tries again
    if (failed) {
      await db.update(participants)
        .set(key === 'event-reminder-h3' ? { eventReminderSentAt: null } : { thankYouSentAt: null })
        .where(eq(participants.id, r.id))
    }
  }
  return rows.length
}

export default defineTask({
  meta: { name: 'events:notify', description: '3-day reminder and next-day thank-you emails (runs once a day)' },
  async run() {
    // reminder: events starting in 1–3 days; thank-you: events that ended in the last week
    const reminded = await notify(events.startDate, wibDate(1), wibDate(3), 'event-reminder-h3')
    const thanked = await notify(events.endDate, wibDate(-7), wibDate(-1), 'event-thank-you')
    return { result: { reminded, thanked } }
  }
})
