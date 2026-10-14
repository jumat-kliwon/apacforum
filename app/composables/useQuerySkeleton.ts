import type { AsyncDataRequestStatus } from '#app'

/**
 * True while a list loads for a new query (search, filter, sort or page), so the table can show
 * skeleton rows. A plain refresh() after an edit keeps the current rows on screen instead.
 */
export function useQuerySkeleton(status: Ref<AsyncDataRequestStatus>, query: Ref<unknown>) {
  const key = computed(() => JSON.stringify(query.value))
  const loadedKey = ref<string | null>(null)
  watch(status, (s) => {
    if (s === 'success' || s === 'error') loadedKey.value = key.value
  }, { immediate: true })
  return computed(() => status.value === 'pending' && loadedKey.value !== key.value)
}
