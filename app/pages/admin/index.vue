<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const eventId = ref<string | undefined>()
const { data, status } = await useFetch('/api/admin/dashboard', { query: { eventId }, watch: [eventId] })
watch(data, (d) => { if (d?.eventId && !eventId.value) eventId.value = d.eventId }, { immediate: true })

const eventItems = computed(() => (data.value?.events ?? []).map(e => ({ label: e.name, value: e.id })))
const eventName = computed(() => data.value?.events.find(e => e.id === data.value?.eventId)?.name ?? '')

const stats = computed(() => {
  const s = data.value?.stats
  if (!s) return []
  return [
    { label: 'Total pendaftar', value: formatNumber(s.total), note: `+${formatNumber(s.today)} hari ini`, icon: 'i-lucide-users' },
    { label: 'Menunggu verifikasi', value: formatNumber(s.pending), note: 'Perlu ditinjau admin', icon: 'i-lucide-clock' },
    { label: 'Pembayaran lunas', value: formatNumber(s.paid), note: s.total ? `${Math.round((s.paid / s.total) * 100)}% dari pendaftar` : '—', icon: 'i-lucide-circle-check' },
    { label: 'Total pendapatan', value: formatRupiahShort(s.revenue), note: formatRupiah(s.revenue), icon: 'i-lucide-credit-card' }
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
  return `Grafik batang pendaftaran harian 14 hari terakhir, dari ${b[0]!.n} pada ${formatIsoDate(b[0]!.day)} sampai ${b.at(-1)!.n} pada ${formatIsoDate(b.at(-1)!.day)}, total ${total14.value}`
})

const payItems = computed(() => {
  const p = data.value?.payStatus ?? {}
  return [
    { label: 'Lunas', value: p.paid ?? 0, color: 'success' as const },
    { label: 'Menunggu', value: p.pending ?? 0, color: 'warning' as const },
    { label: 'Kedaluwarsa', value: p.expired ?? 0, color: 'error' as const },
    { label: 'Refund', value: p.refunded ?? 0, color: 'neutral' as const }
  ]
})

const now = new Date()
</script>

<template>
  <AdminPageHeader title="Dashboard">
    <template #description>
      Ringkasan {{ eventName }} · data per {{ formatDateWithDay(now) }} pukul {{ formatDateTime(now).split(', ').at(-1) }} WIB
    </template>
    <template #actions>
      <USelect v-model="eventId" :items="eventItems" icon="i-lucide-calendar-days" aria-label="Pilih event" class="min-w-56" />
    </template>
  </AdminPageHeader>

  <div v-if="!data?.stats && status !== 'pending'" class="rounded-2xl border border-default bg-default p-10">
    <UEmpty icon="i-lucide-calendar-plus" title="Belum ada event" description="Buat event pertama untuk mulai menerima pendaftaran." :actions="[{ label: 'Tambah event', to: '/admin/event/baru', icon: 'i-lucide-plus' }]" />
  </div>

  <template v-else>
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard v-for="s in stats" :key="s.label" v-bind="s" />
    </div>

    <div class="grid items-start gap-6 xl:grid-cols-2">
      <AdminPanel title="Pendaftaran 14 hari terakhir">
        <template #actions>
          <span class="text-[13px] font-medium text-muted">{{ formatNumber(total14) }} pendaftar</span>
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

      <AdminPanel title="Kuota tiket per tipe peserta">
        <div class="flex flex-col gap-4">
          <div v-for="q in data?.quotas" :key="q.name" class="flex flex-col gap-1.5">
            <div class="flex justify-between gap-3 text-sm font-medium">
              <span>{{ q.name }}</span>
              <span class="text-muted tabular-nums">{{ formatNumber(q.sold) }} / {{ formatNumber(q.quota) }}</span>
            </div>
            <UProgress :model-value="q.quota ? Math.min(100, (q.sold / q.quota) * 100) : 0" size="sm" :ui="{ indicator: 'bg-brand-400' }" :aria-label="`${q.name}: ${q.sold} dari ${q.quota} terjual`" />
          </div>
          <p v-if="!data?.quotas.length" class="text-sm text-muted">
            Belum ada tipe tiket.
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

    <AdminPanel title="Pendaftar terbaru">
      <template #actions>
        <UButton :to="{ path: '/admin/peserta', query: { eventId } }" color="neutral" variant="ghost" size="sm" trailing-icon="i-lucide-chevron-right" label="Lihat semua peserta" />
      </template>
      <AdminParticipantMiniTable :rows="data?.recent ?? []" />
    </AdminPanel>
  </template>
</template>
