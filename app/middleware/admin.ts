/** How long a confirmed admin session is trusted before asking the server again. Every API call is still checked. */
const RECHECK_MS = 5 * 60_000

/** CMS pages require a staff session; pages without `access: 'staff'` are for superadmins only. */
export default defineNuxtRouteMiddleware(async (to) => {
  const checkedAt = useAdminSessionCheckedAt()
  const role = useAdminRole()
  if (Date.now() - checkedAt.value >= RECHECK_MS) {
    const { data } = await authClient.getSession()
    const userRole = (data?.user as { role?: string } | undefined)?.role
    if (!isStaff(userRole)) {
      checkedAt.value = 0
      role.value = undefined
      return navigateTo({ path: '/login', query: to.fullPath !== '/admin' ? { redirect: to.fullPath } : undefined })
    }
    checkedAt.value = Date.now()
    role.value = userRole
  }
  if (!hasAccess(role.value, to.meta.access ?? 'superadmin')) {
    return navigateTo(deniedPath(to.path), { replace: true })
  }
})
