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
