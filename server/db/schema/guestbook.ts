import { index, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core'
import { citext, id, timestamps } from '../columns'
import { events } from './events'

/** Messages left through the /contact form, each filed under the event the site featured at the time. */
export const guestbookEntries = pgTable('guestbook_entries', {
  id: id(),
  eventId: uuid().notNull().references(() => events.id, { onDelete: 'cascade' }),
  name: varchar({ length: 200 }).notNull(),
  email: citext().notNull(),
  institution: varchar({ length: 200 }),
  position: varchar({ length: 200 }),
  country: varchar({ length: 120 }),
  topic: varchar({ length: 120 }),
  message: text().notNull().default(''),
  ...timestamps
}, t => [
  index().on(t.eventId, t.createdAt)
])
