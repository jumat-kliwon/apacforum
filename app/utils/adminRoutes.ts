import type { Permission } from '../../shared/utils/access'

/** Sections of the event-scoped CMS under /admin/e/[eventId]. '' is the dashboard. */
export type EventSection = '' | 'registrations' | 'transactions' | 'tickets' | 'speakers' | 'partners' | 'guestbook' | 'settings'

const SECTIONS: EventSection[] = ['registrations', 'transactions', 'tickets', 'speakers', 'partners', 'guestbook', 'settings']

/** URL of a page inside an event, e.g. eventPath(id, 'transactions', trxId). */
export function eventPath(eventId: string, section: EventSection = '', ...rest: string[]) {
  return ['/admin/e', eventId, section, ...rest].filter(Boolean).join('/')
}

/**
 * Where the event switcher goes: the same section in the other event, on its main page.
 * Record ids and list filters belong to the old event, so they are dropped. Only the settings tab carries over.
 */
export function switchEventPath(path: string, query: Record<string, unknown>, eventId: string) {
  const segment = /^\/admin\/e\/[^/]+\/([^/]+)/.exec(path)?.[1]
  const section = SECTIONS.find(s => s === segment) ?? ''
  const target = eventPath(eventId, section)
  const tab = section === 'settings' && typeof query.tab === 'string' ? query.tab : undefined
  return tab ? `${target}?tab=${encodeURIComponent(tab)}` : target
}

/** Permission each event section needs. */
export const SECTION_PERMISSION: Record<EventSection, Permission> = {
  '': 'dashboard.view',
  'registrations': 'registrations.manage',
  'transactions': 'transactions.manage',
  'tickets': 'events.manage',
  'speakers': 'events.manage',
  'partners': 'events.manage',
  'guestbook': 'guestbook.manage',
  'settings': 'events.manage'
}

/** CMS pages outside an event, in menu order, with the permission each needs. */
export const WORKSPACE_PAGES: [path: string, permission: Permission][] = [
  ['/admin/events', 'events.manage'],
  ['/admin/news', 'news.manage'],
  ['/admin/email-templates', 'email_templates.view'],
  ['/admin/access/users', 'access.manage']
]

/** The first event section the permissions open, in menu order. */
export function firstEventSection(permissions: readonly string[]) {
  return (['', ...SECTIONS] as EventSection[]).find(s => permissions.includes(SECTION_PERMISSION[s]))
}

/**
 * Where a user lands after signing in or when it opens a page it may not see: the first allowed section of
 * the event it is in (or `/admin`, which picks an event), else the first allowed workspace page.
 */
export function landingPath(permissions: readonly string[], eventId?: string) {
  const section = firstEventSection(permissions)
  if (section !== undefined) return eventId ? eventPath(eventId, section) : '/admin'
  return WORKSPACE_PAGES.find(([, p]) => permissions.includes(p))?.[0] ?? '/login'
}

export type PageSkeleton = 'list' | 'detail' | 'form' | 'dashboard'

/** Which loading skeleton fits a CMS page, from its path. */
export function pageSkeleton(path: string): PageSkeleton {
  const p = path.replace(/\/+$/, '')
  const ev = /^\/admin\/e\/[^/]+(?:\/([^/]+)(?:\/([^/]+))?)?/.exec(p)
  if (ev) {
    const [, section, record] = ev
    if (!section) return 'dashboard'
    if (section === 'settings') return record === 'edit' ? 'form' : 'detail'
    if (section === 'tickets' || section === 'speakers' || section === 'partners') return record ? 'form' : 'list'
    return record ? 'detail' : 'list'
  }
  if (/^\/admin\/(events|news|access\/roles)\/(new|[^/]+\/edit|[0-9a-f-]{36})$/.test(p)) return 'form'
  if (p === '/admin/email-templates') return 'detail'
  return 'list'
}
