<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const eventId = useEventId()
const { event } = useCurrentEvent()
const { data } = await useFetch('/api/admin/dashboard', { query: { eventId } })

const eventName = computed(() => event.value?.name ?? '')

const stats = computed(() => {
  const s = data.value?.stats
  if (!s) return []
  return [
    { label: 'Total registrations', value: formatNumber(s.total), note: `+${formatNumber(s.today)} today`, icon: 'i-lucide-users' },
    { label: 'Pending verification', value: formatNumber(s.pending), note: 'Needs an admin review', icon: 'i-lucide-clock' },
    { label: 'Paid', value: formatNumber(s.paid), note: s.total ? `${Math.round((s.paid / s.total) * 100)}% of registrations` : '—', icon: 'i-lucide-circle-check' },
    { label: 'Total revenue', value: formatRupiahShort(s.revenue), note: formatRupiah(s.revenue), icon: 'i-lucide-credit-card' }
  ]
})

const bars = computed(() => {
  const daily = data.value?.daily ?? []
  const max = Math.max(1, ...daily.map(d => d.n))
  return daily.map((d, i) => ({
    ...d,
    label: String(Number(d.day.slice(8, 10))),
    height: `${Math.max(2, Math.round((d.n / max) * 100))}%`,
    last: i === daily.length - 1
  }))
})
const total14 = computed(() => bars.value.reduce((s, b) => s + b.n, 0))
const chartLabel = computed(() => {
  const b = bars.value
  if (!b.length) return ''
  return `Bar chart of daily registrations over the last 14 days, from ${b[0]!.n} on ${formatIsoDate(b[0]!.day)} to ${b.at(-1)!.n} on ${formatIsoDate(b.at(-1)!.day)}, ${total14.value} in total`
})

const payItems = computed(() => {
  const p = data.value?.payStatus
  return [
    { label: 'Paid', value: p?.paid ?? 0, color: 'success' as const },
    { label: 'Awaiting', value: p?.pending ?? 0, color: 'warning' as const },
    { label: 'Expired', value: p?.expired ?? 0, color: 'error' as const },
    { label: 'Refunded', value: p?.refunded ?? 0, color: 'neutral' as const }
  ]
})

const now = new Date()
</script>

<template>
  <AdminPageHeader title="Dashboard">
    <template #description>
      {{ eventName }} overview · as of {{ formatDateWithDay(now) }}, {{ formatTime(now) }} WIB
    </template>
  </AdminPageHeader>

  <template v-if="data">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard v-for="s in stats" :key="s.label" v-bind="s" />
    </div>

    <div class="grid items-start gap-6 xl:grid-cols-2">
      <AdminPanel title="Registrations, last 14 days">
        <template #actions>
          <span class="text-[13px] font-medium text-muted">{{ formatNumber(total14) }} registrations</span>
        </template>
        <div role="img" :aria-label="chartLabel">
          <div class="flex h-56 items-end gap-2 border-b border-default pt-4">
            <div v-for="b in bars" :key="b.day" class="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span class="text-[11px] font-medium text-muted tabular-nums">{{ b.n }}</span>
              <div class="w-full rounded-t" :class="b.last ? 'bg-brand-400' : 'bg-brand-200'" :style="{ height: b.height }" />
            </div>
          </div>
          <div class="mt-2 flex gap-2" aria-hidden="true">
            <span v-for="b in bars" :key="b.day" class="flex-1 text-center text-[11px] text-muted">{{ b.label }}</span>
          </div>
        </div>
      </AdminPanel>

      <AdminPanel title="Ticket quota per participant type">
        <div class="flex flex-col gap-4">
          <div v-for="q in data?.quotas" :key="q.name" class="flex flex-col gap-1.5">
            <div class="flex justify-between gap-3 text-sm font-medium">
              <span>{{ q.name }}</span>
              <span class="text-muted tabular-nums">{{ formatNumber(q.sold) }} / {{ formatNumber(q.quota) }}</span>
            </div>
            <UProgress :model-value="q.quota ? Math.min(100, (q.sold / q.quota) * 100) : 0" size="sm" :ui="{ indicator: 'bg-brand-400' }" :aria-label="`${q.name}: ${q.sold} of ${q.quota} sold`" />
          </div>
          <p v-if="!data?.quotas.length" class="text-sm text-muted">
            No ticket types yet.
          </p>
        </div>
        <div class="grid grid-cols-2 gap-3 border-t border-default pt-4">
          <div v-for="p in payItems" :key="p.label" class="flex items-center justify-between gap-2">
            <UBadge :color="p.color" :label="p.label" />
            <span class="text-sm font-semibold tabular-nums">{{ formatNumber(p.value) }}</span>
          </div>
        </div>
      </AdminPanel>
    </div>

    <AdminPanel title="Latest registrations">
      <template #actions>
        <UButton :to="eventPath(eventId, 'registrations')" color="neutral" variant="ghost" size="sm" trailing-icon="i-lucide-chevron-right" label="See all participants" />
      </template>
      <AdminParticipantMiniTable :rows="data?.recent ?? []" />
    </AdminPanel>
  </template>
</template>
