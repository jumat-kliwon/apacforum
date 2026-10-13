import { h } from 'vue'
import SortButton from '~/components/admin/SortButton.vue'

/**
 * List state (search, filters, sort, page) synced to the URL query,
 * so filters survive a round trip to a detail page.
 */
export function useListQuery<F extends Record<string, string | undefined>>(defaults: { sort: string, dir: 'asc' | 'desc', filters: F }) {
  const route = useRoute()
  const router = useRouter()
  const str = (v: unknown) => (typeof v === 'string' && v !== '' ? v : undefined)

  const q = ref(str(route.query.q) ?? '')
  const page = ref(Number(route.query.page) || 1)
  const pageSize = ref(Number(route.query.pageSize) || 10)
  const sort = ref(str(route.query.sort) ?? defaults.sort)
  const dir = ref<'asc' | 'desc'>(route.query.dir === 'asc' ? 'asc' : route.query.dir === 'desc' ? 'desc' : defaults.dir)
  const filters = reactive(Object.fromEntries(
    Object.keys(defaults.filters).map(k => [k, str(route.query[k]) ?? defaults.filters[k]])
  )) as F

  const debouncedQ = refDebounced(q, 300)

  const query = computed(() => {
    const out: Record<string, string | number> = { page: page.value, pageSize: pageSize.value, sort: sort.value, dir: dir.value }
    if (debouncedQ.value) out.q = debouncedQ.value
    for (const [k, v] of Object.entries(filters)) if (v) out[k] = v
    return out
  })

  watch(query, v => router.replace({ query: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, String(x)])) }))
  watch([debouncedQ, pageSize, () => ({ ...filters })], () => { page.value = 1 })

  function toggleSort(key: string) {
    if (sort.value === key) dir.value = dir.value === 'asc' ? 'desc' : 'asc'
    else {
      sort.value = key
      dir.value = 'asc'
    }
  }

  /** Sortable column header, for UTable `columns[].header`. */
  const sortHeader = (key: string, label: string) => () =>
    h(SortButton, { label, active: sort.value === key, dir: dir.value, onToggle: () => toggleSort(key) })

  const ariaSort = (key: string) => (sort.value === key ? (dir.value === 'asc' ? 'ascending' : 'descending') : 'none')

  return { q, page, pageSize, sort, dir, filters, query, toggleSort, sortHeader, ariaSort }
}

function refDebounced<T>(source: Ref<T>, ms: number) {
  const out = ref(source.value) as Ref<T>
  let t: ReturnType<typeof setTimeout> | undefined
  watch(source, (v) => {
    clearTimeout(t)
    t = setTimeout(() => { out.value = v }, ms)
  })
  return out
}
