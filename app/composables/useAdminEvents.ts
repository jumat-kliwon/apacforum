export type AdminEventOption = {
  id: string
  code: string
  name: string
  status: 'draft' | 'published' | 'archived'
  startDate: string
  endDate: string
  city: string
}

/**
 * Every event, newest first, for the event switcher and the event routes.
 * Loaded once. Call `load(true)` after an event is created, edited, archived or deleted.
 */
export function useAdminEvents() {
  const events = useState<AdminEventOption[] | null>('admin-events', () => null)
  async function load(force = false) {
    if (events.value && !force) return events.value
    const res = await $fetch('/api/admin/event-options')
    events.value = res.events
    return res.events
  }
  return { events, load }
}

/** The event the admin opened last, so /admin can go straight back to it. */
export function useLastEventId() {
  return useCookie<string | null>('admin_last_event', { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax', default: () => null })
}

/** The event the admin is working in: the one in the URL under /admin/e/[eventId], else the last one opened. */
export function useCurrentEvent() {
  const route = useRoute()
  const last = useLastEventId()
  const { events } = useAdminEvents()
  const id = computed(() => (typeof route.params.eventId === 'string' ? route.params.eventId : last.value) ?? null)
  const event = computed(() => events.value?.find(e => e.id === id.value) ?? null)
  return { id, event }
}

/** Event id of a page under /admin/e/[eventId]. Those pages remount when the event changes, so a plain string is enough. */
export function useEventId() {
  return String(useRoute().params.eventId)
}
