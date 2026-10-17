import type { FetchError } from 'ofetch'

/** How long the loaded permissions are trusted before asking the server again. Every API call is still checked. */
const RECHECK_MS = 5 * 60_000

/** CMS pages require a CMS session and the permission in the page's `permission` meta. */
export default defineNuxtRouteMiddleware(async (to) => {
  const checkedAt = useAdminSessionCheckedAt()
  const { access } = useAdminAccess()
  if (!access.value || Date.now() - checkedAt.value >= RECHECK_MS) {
    try {
      access.value = await $fetch<AdminAccess>('/api/admin/me')
      checkedAt.value = Date.now()
    } catch (err) {
      checkedAt.value = 0
      access.value = null
      // 403: signed in, but the role has no CMS access
      if ((err as FetchError).statusCode === 403) await authClient.signOut()
      return navigateTo({ path: '/login', query: to.fullPath !== '/admin' ? { redirect: to.fullPath } : undefined })
    }
  }
  const needed = to.meta.permission
  const permissions = access.value!.permissions
  const allowed = needed === 'any' || (needed ? can(permissions, needed) : access.value!.role.key === SUPERADMIN_ROLE)
  if (!allowed) {
    const eventId = typeof to.params.eventId === 'string' ? to.params.eventId : undefined
    return navigateTo(landingPath(permissions, eventId), { replace: true })
  }
})
