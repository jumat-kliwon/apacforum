/**
 * Where the public site's Register buttons go: the CMS's default event — its form while
 * registration is open, its page otherwise — or `fallback` when no event is the default.
 */
export async function useRegisterHref(fallback = '#registration') {
  const { data: events } = await useFetch('/api/public/events', { key: 'public-events' })
  return computed(() => {
    const ev = events.value?.find(e => e.isDefault)
    if (!ev) return fallback
    return ev.isOpen ? `/events/${ev.slug}/register` : `/events/${ev.slug}`
  })
}
