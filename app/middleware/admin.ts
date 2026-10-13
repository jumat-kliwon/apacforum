/** Halaman CMS: wajib login sebagai admin. */
export default defineNuxtRouteMiddleware(async (to) => {
  const { data } = await authClient.getSession()
  if (!data || (data.user as { role?: string }).role !== 'admin') {
    return navigateTo({ path: '/login', query: to.fullPath !== '/admin' ? { redirect: to.fullPath } : undefined })
  }
})
