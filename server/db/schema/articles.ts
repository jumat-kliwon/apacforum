import { sql } from 'drizzle-orm'
import { boolean, index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { id, timestamps } from '../columns'
import { users } from './auth'
import { publishStatus } from './enums'

/** News & Media: articles shown on /news. `content` is HTML from the rich-text editor. */
export const articles = pgTable('articles', {
  id: id(),
  title: varchar({ length: 200 }).notNull(),
  slug: varchar({ length: 160 }).notNull().unique(),
  /** Short summary for lists; also the fallback meta description. */
  excerpt: varchar({ length: 500 }),
  content: text().notNull().default(''),
  /** Object key in Cloudflare R2. */
  thumbnailKey: text(),
  status: publishStatus().notNull().default('draft'),
  publishedAt: timestamp({ withTimezone: true }),
  authorId: uuid().references(() => users.id, { onDelete: 'set null' }),
  // SEO — every field falls back to the article's own data when empty
  seoTitle: varchar({ length: 70 }),
  seoDescription: varchar({ length: 160 }),
  seoKeywords: varchar({ length: 255 }),
  /** Social share image; falls back to the thumbnail. */
  ogImageKey: text(),
  canonicalUrl: text(),
  noIndex: boolean().notNull().default(false),
  ...timestamps
}, t => [
  index().on(t.status, t.publishedAt.desc()),
  index('articles_title_trgm').using('gin', sql`${t.title} gin_trgm_ops`)
])
