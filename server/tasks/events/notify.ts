import { and, eq } from 'drizzle-orm'
import { db } from '../../db'
import { events, participants } from '../../db/schema'
import { loadMailData } from '../../services/context'
import { sendTemplateSafe } from '../../services/mail/send'

/** Tanggal WIB `YYYY-MM-DD` digeser n hari. */
const wibDate = (offsetDays: number) =>
  new Date(Date.now() + 7 * 3600_000 + offsetDays * 86_400_000).toISOString().slice(0, 10)

async function notify(dateColumn: typeof events.startDate | typeof events.endDate, date: string, key: 'event-reminder-h3' | 'event-thank-you') {
  const rows = await db.select({ id: participants.id }).from(participants)
    .innerJoin(events, eq(events.id, participants.eventId))
    .where(and(eq(dateColumn, date), eq(events.status, 'published'), eq(participants.status, 'verified'), eq(participants.paymentStatus, 'paid')))
  for (const r of rows) {
    const data = await loadMailData(r.id)
    if (data) await sendTemplateSafe(key, data)
  }
  return rows.length
}

export default defineTask({
  meta: { name: 'events:notify', description: 'Pengingat H-3 dan email terima kasih H+1 (jalan sekali sehari)' },
  async run() {
    const reminded = await notify(events.startDate, wibDate(3), 'event-reminder-h3')
    const thanked = await notify(events.endDate, wibDate(-1), 'event-thank-you')
    return { result: { reminded, thanked } }
  }
})
