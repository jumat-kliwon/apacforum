<script setup lang="ts">
import type { TimelineItem } from '@nuxt/ui'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const notify = useNotify()
const id = computed(() => String(route.params.id))
const { data, error, refresh } = await useFetch(() => `/api/admin/transactions/${id.value}`)

const trx = computed(() => data.value?.trx)
const methodText = computed(() => {
  const t = trx.value
  if (!t?.method) return null
  return t.method === 'virtual_account' && t.payment.channel ? `Virtual Account ${t.payment.channel}` : `${PAYMENT_METHOD[t.method]}${t.payment.channel ? ` ${t.payment.channel}` : ''}`
})

const subtitle = computed(() => {
  const t = trx.value
  if (!t) return ''
  if (t.status === 'paid' && t.paidAt) return `Dibayar ${formatDateWithDay(t.paidAt)} pukul ${formatDateTime(t.paidAt).split(', ').at(-1)} WIB${methodText.value ? ` lewat ${methodText.value}` : ''}`
  if (t.status === 'pending' && t.expiresAt) return `Menunggu pembayaran sampai ${formatDateTime(t.expiresAt)} WIB`
  if (t.status === 'expired') return 'Tagihan kedaluwarsa sebelum dibayar'
  if (t.status === 'refunded' && t.payment.refundedAt) return `Refund diproses ${formatDateTime(t.payment.refundedAt)} WIB`
  return ''
})

const payInfo = computed(() => {
  const t = trx.value
  if (!t) return []
  return ([
    ['Metode', methodText.value],
    ['Nomor VA', t.payment.vaNumber],
    ['ID referensi DOKU', t.payment.dokuReference],
    ['Link pembayaran', t.payment.dokuPaymentUrl],
    ['Tagihan dibuat', `${formatDateTime(t.createdAt)} WIB`],
    ['Batas pembayaran', t.expiresAt ? `${formatDateTime(t.expiresAt)} WIB` : null],
    ['Dibayar', t.paidAt ? `${formatDateTime(t.paidAt)} WIB` : null],
    ['Jumlah refund', t.payment.refundAmount != null ? formatRupiah(t.payment.refundAmount) : null],
    ['Catatan admin', t.payment.adminNote]
  ] as [string, string | null | undefined][]).filter(([, v]) => v)
})

const ICON: Record<string, string> = {
  created: 'i-lucide-file-text', invoice_sent: 'i-lucide-mail', paid: 'i-lucide-check', ticket_sent: 'i-lucide-send',
  expired: 'i-lucide-clock-alert', refunded: 'i-lucide-rotate-ccw', note: 'i-lucide-sticky-note'
}
const timeline = computed<TimelineItem[]>(() => [...(trx.value?.history ?? [])].reverse().map(h => ({
  title: HISTORY_LABEL[h.type],
  description: [formatDateTime(h.at), h.description, h.actor ? `oleh ${h.actor.name}` : null].filter(Boolean).join(' · '),
  icon: ICON[h.type]
})))

const refundOpen = ref(false)
const refunding = ref(false)
async function doRefund() {
  refunding.value = true
  try {
    await $fetch(`/api/admin/transactions/${id.value}/refund`, { method: 'POST', body: {} })
    notify.success('Refund diproses', 'Pendaftaran dibatalkan dan email refund dikirim ke peserta.')
    refundOpen.value = false
    await refresh()
  } catch (err) {
    notify.error(err)
  } finally {
    refunding.value = false
  }
}
</script>

<template>
  <div v-if="error" class="rounded-2xl border border-default bg-default p-10">
    <UEmpty icon="i-lucide-receipt" title="Transaksi tidak ditemukan" :actions="[{ label: 'Kembali ke transaksi', to: '/admin/transaksi' }]" />
  </div>

  <template v-else-if="trx && data">
    <AdminPageHeader :title="trx.invoiceNo" :description="subtitle" :breadcrumb="[{ label: 'Transaksi', to: '/admin/transaksi' }, { label: trx.invoiceNo }]">
      <template #badges>
        <UBadge v-bind="TRANSACTION_STATUS[trx.status]" size="lg" />
      </template>
      <template #actions>
        <UButton v-if="trx.status === 'paid'" color="error" variant="outline" icon="i-lucide-rotate-ccw" label="Proses refund" @click="refundOpen = true" />
      </template>
    </AdminPageHeader>

    <div class="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div class="flex flex-col gap-6">
        <AdminPanel title="Rincian tagihan">
          <UTable
            :data="trx.items.lines"
            :columns="[{ id: 'item', header: 'Item' }, { id: 'qty', header: 'Qty' }, { id: 'price', header: 'Harga' }, { id: 'subtotal', header: 'Subtotal' }]"
            class="-mx-4 sm:-mx-5"
          >
            <template #item-cell="{ row }">
              <div class="font-medium text-highlighted">{{ row.original.description }}</div>
              <div v-if="row.original.note" class="text-xs text-muted">{{ row.original.note }}</div>
            </template>
            <template #qty-cell="{ row }">
              <span class="tabular-nums">{{ row.original.qty }}</span>
            </template>
            <template #price-cell="{ row }">
              <span class="tabular-nums">{{ formatRupiah(row.original.unitPrice) }}</span>
            </template>
            <template #subtotal-cell="{ row }">
              <span class="tabular-nums">{{ formatRupiah(row.original.subtotal) }}</span>
            </template>
          </UTable>
          <dl class="ml-auto grid w-full max-w-xs grid-cols-2 gap-y-2 text-sm">
            <dt class="text-muted">Subtotal</dt>
            <dd class="text-right tabular-nums">{{ formatRupiah(trx.items.subtotal) }}</dd>
            <dt class="text-muted">Diskon</dt>
            <dd class="text-right tabular-nums">{{ formatRupiah(trx.items.discount) }}</dd>
            <dt class="border-t border-default pt-2 font-semibold">Total{{ trx.status === 'paid' || trx.status === 'refunded' ? ' dibayar' : '' }}</dt>
            <dd class="border-t border-default pt-2 text-right font-bold tabular-nums">{{ formatRupiah(trx.total) }}</dd>
          </dl>
        </AdminPanel>

        <AdminPanel title="Informasi pembayaran">
          <dl class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3 text-sm">
            <template v-for="[k, v] in payInfo" :key="k">
              <dt class="text-muted">{{ k }}</dt>
              <dd class="break-all font-medium text-highlighted">
                <a v-if="k === 'Link pembayaran'" :href="v!" target="_blank" rel="noopener" class="text-primary hover:underline">{{ v }}</a>
                <template v-else>{{ v }}</template>
              </dd>
            </template>
          </dl>
        </AdminPanel>
      </div>

      <div class="flex flex-col gap-6">
        <AdminPanel title="Peserta">
          <div class="flex items-center gap-3">
            <UAvatar :text="initials(trx.participantName)" class="bg-brand-50 text-brand-900" />
            <div class="min-w-0">
              <NuxtLink v-if="data.user" :to="`/admin/peserta/${data.user.id}`" class="font-semibold text-highlighted hover:underline">{{ trx.participantName }}</NuxtLink>
              <span v-else class="font-semibold text-highlighted">{{ trx.participantName }}</span>
              <div class="truncate text-xs text-muted">{{ trx.participantEmail }}</div>
            </div>
          </div>
          <dl class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3 text-sm">
            <dt class="text-muted">Instansi</dt>
            <dd class="font-medium">{{ data.user?.organization ?? '—' }}</dd>
            <dt class="text-muted">Telepon</dt>
            <dd class="font-medium">{{ data.user?.phone ?? '—' }}</dd>
            <dt class="text-muted">Event</dt>
            <dd class="font-medium">
              <NuxtLink v-if="data.event?.id" :to="`/admin/event/${data.event.id}`" class="text-primary hover:underline">{{ trx.eventName }}</NuxtLink>
              <template v-else>{{ trx.eventName }}</template>
            </dd>
            <dt class="text-muted">Pendaftaran</dt>
            <dd class="font-mono text-[13px]">{{ data.regNo ?? 'Sudah dihapus' }}</dd>
          </dl>
          <UButton v-if="data.user" :to="`/admin/peserta/${data.user.id}`" color="neutral" variant="outline" block label="Lihat profil peserta" />
        </AdminPanel>

        <AdminPanel title="Riwayat status">
          <UTimeline :items="timeline" :default-value="0" size="xs" />
        </AdminPanel>
      </div>
    </div>

    <AdminConfirmDialog
      v-model:open="refundOpen"
      :title="`Proses refund ${formatRupiah(trx.total)}?`"
      :description="`E-tiket ${trx.participantName} untuk ${trx.eventName} dibatalkan dan status pendaftarannya menjadi Dibatalkan. Dana dikembalikan ke metode pembayaran awal dalam 7–14 hari kerja. Tindakan ini tidak bisa dibatalkan.`"
      confirm-label="Proses refund"
      icon="i-lucide-rotate-ccw"
      :loading="refunding"
      @confirm="doRefund"
    />
  </template>
</template>
