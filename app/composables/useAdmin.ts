import type { FetchError } from 'ofetch'

/** Pesan error dari API (statusMessage dari createError). */
export function errorMessage(err: unknown, fallback = 'Terjadi kesalahan') {
  const e = err as FetchError<{ statusMessage?: string, message?: string }>
  return e?.data?.statusMessage ?? e?.data?.message ?? e?.statusMessage ?? fallback
}

export function useNotify() {
  const toast = useToast()
  return {
    success: (title: string, description?: string) => toast.add({ title, description, color: 'success', icon: 'i-lucide-circle-check' }),
    error: (err: unknown, title = 'Gagal') => toast.add({ title, description: errorMessage(err), color: 'error', icon: 'i-lucide-circle-alert' })
  }
}

export function useAdminSession() {
  return authClient.useSession()
}

/** `true` → aria-sort, untuk header kolom yang bisa diurutkan. */
export type SortDir = 'asc' | 'desc'
