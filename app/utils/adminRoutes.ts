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

/**
 * Where an `admin` goes when it opens a superadmin page: the event's registrations
 * (instead of its dashboard or transactions), else News & Media.
 */
export function deniedPath(path: string) {
  const eventId = /^\/admin\/e\/([^/]+)/.exec(path)?.[1]
  return eventId ? eventPath(eventId, 'registrations') : '/admin/news'
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
  if (/^\/admin\/(events|news)\/(new|[^/]+\/edit|[0-9a-f-]{36})$/.test(p)) return 'form'
  if (p === '/admin/email-templates') return 'detail'
  return 'list'
}
