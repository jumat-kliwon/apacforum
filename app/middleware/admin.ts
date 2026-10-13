/** How long a confirmed admin session is trusted before asking the server again. Every API call is still checked. */
const RECHECK_MS = 5 * 60_000

/** CMS pages require an admin session. */
export default defineNuxtRouteMiddleware(async (to) => {
  const checkedAt = useAdminSessionCheckedAt()
  if (Date.now() - checkedAt.value < RECHECK_MS) return

  const { data } = await authClient.getSession()
  if (!data || (data.user as { role?: string }).role !== 'admin') {
    checkedAt.value = 0
    return navigateTo({ path: '/login', query: to.fullPath !== '/admin' ? { redirect: to.fullPath } : undefined })
  }
  checkedAt.value = Date.now()
})
