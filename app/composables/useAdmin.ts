import type { FetchError } from 'ofetch'

/** Error message from the API (the statusMessage passed to createError). */
export function errorMessage(err: unknown, fallback = 'Something went wrong') {
  const e = err as FetchError<{ statusMessage?: string, message?: string }>
  return e?.data?.statusMessage ?? e?.data?.message ?? e?.statusMessage ?? fallback
}

export function useNotify() {
  const toast = useToast()
  return {
    success: (title: string, description?: string) => toast.add({ title, description, color: 'success', icon: 'i-lucide-circle-check' }),
    error: (err: unknown, title = 'Something went wrong') => toast.add({ title, description: errorMessage(err), color: 'error', icon: 'i-lucide-circle-alert' })
  }
}

export function useAdminSession() {
  return authClient.useSession()
}

/** When the admin middleware last confirmed the session (0 = not confirmed). */
export function useAdminSessionCheckedAt() {
  return useState('admin-session-checked-at', () => 0)
}

export type AdminAccess = {
  user: { id: string, name: string, email: string }
  role: { key: string, name: string }
  permissions: Permission[]
}

/** The signed-in CMS user, its role and permissions (from /api/admin/me, loaded by the admin middleware). */
export function useAdminAccess() {
  const access = useState<AdminAccess | null>('admin-access', () => null)
  /** Whether the user holds at least one of `needed`. Only hides UI: the API checks every request. */
  const allowed = (needed: Permission | Permission[]) => can(access.value?.permissions, needed)
  return { access, can: allowed }
}
