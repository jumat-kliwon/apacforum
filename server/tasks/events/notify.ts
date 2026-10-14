import { and, eq, inArray, isNull } from 'drizzle-orm'
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

async function notify(dateColumn: typeof events.startDate | typeof events.endDate, date: string, key: keyof typeof SENT_AT) {
  const sentAt = SENT_AT[key]
  const eventIds = db.select({ id: events.id }).from(events).where(and(eq(dateColumn, date), eq(events.status, 'published')))
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
    if (data) await sendTemplateSafe(key, data)
  }
  return rows.length
}

export default defineTask({
  meta: { name: 'events:notify', description: '3-day reminder and next-day thank-you emails (runs once a day)' },
  async run() {
    const reminded = await notify(events.startDate, wibDate(3), 'event-reminder-h3')
    const thanked = await notify(events.endDate, wibDate(-1), 'event-thank-you')
    return { result: { reminded, thanked } }
  }
})
