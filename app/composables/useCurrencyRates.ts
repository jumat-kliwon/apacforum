import type { ForeignCurrency } from '~~/shared/utils/money'

/** Current USD/SGD rates for the event and ticket forms. Shared by key, so one request serves the page. */
export function useCurrencyRates() {
  const { data, refresh } = useFetch('/api/admin/currency-rates', { key: 'admin-currency-rates', default: () => [] })
  const rateOf = (cur: ForeignCurrency) => data.value.find(r => r.currency === cur)?.rateIdr ?? null
  return { rates: data, rateOf, refresh }
}
