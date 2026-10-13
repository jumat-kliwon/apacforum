/** Sections of the event-scoped CMS under /admin/e/[eventId]. '' is the dashboard. */
export type EventSection = '' | 'registrations' | 'transactions' | 'settings'

const SECTIONS: EventSection[] = ['registrations', 'transactions', 'settings']

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
