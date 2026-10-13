import '@tanstack/table-core'

declare module '@tanstack/table-core' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    /** Name shown in the "Columns" visibility menu. */
    label?: string
  }
}
