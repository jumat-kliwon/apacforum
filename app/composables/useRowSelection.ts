import type { TableColumn } from '@nuxt/ui'
import type { Ref } from 'vue'
// resolveComponent() only resolves auto-imported components inside .vue files, so import it
import { UCheckbox } from '#components'

/**
 * Checkbox selection for an admin table. `column` is the leading `select` column: a select-all
 * header for the current page and a checkbox per row. Rows that leave the page drop out of the selection.
 */
export function useRowSelection<T extends { id: string }>(rows: Ref<T[]>, labels: { all: string, row: (r: T) => string }) {
  const selected = ref<Set<string>>(new Set())
  watch(rows, () => { selected.value = new Set([...selected.value].filter(id => rows.value.some(r => r.id === id))) })

  const allState = computed(() => {
    const n = rows.value.filter(r => selected.value.has(r.id)).length
    return n === 0 ? false : n === rows.value.length ? true : 'indeterminate' as const
  })
  const toggleAll = (v: unknown) => { selected.value = v === true ? new Set(rows.value.map(r => r.id)) : new Set() }
  function toggleRow(id: string, v: unknown) {
    const s = new Set(selected.value)
    if (v === true) s.add(id)
    else s.delete(id)
    selected.value = s
  }
  const clear = () => { selected.value = new Set() }

  const column: TableColumn<T> = {
    id: 'select',
    header: () => h(UCheckbox, { 'modelValue': allState.value, 'onUpdate:modelValue': toggleAll, 'aria-label': labels.all }),
    cell: ({ row }) => h(UCheckbox, {
      'modelValue': selected.value.has(row.original.id),
      'onUpdate:modelValue': (v: unknown) => toggleRow(row.original.id, v),
      'aria-label': labels.row(row.original)
    }),
    enableHiding: false
  }

  return { selected, ids: computed(() => [...selected.value]), clear, column }
}
