<script setup lang="ts">
import type { TimelineItem } from '@nuxt/ui'

definePageMeta({ layout: 'admin', middleware: 'admin', permission: 'transactions.manage' })

const route = useRoute()
const notify = useNotify()
const { can } = useAdminAccess()
const id = computed(() => String(route.params.id))
const { data, error, refresh } = await useFetch(() => `/api/admin/transactions/${id.value}`)
const eventId = useEventId()
// a transaction is shown under its own event; one whose event was deleted has no page
if (data.value) {
  if (!data.value.event) throw createError({ statusCode: 404, statusMessage: 'Transaction not found', fatal: true })
  if (data.value.event.id !== eventId) await navigateTo(eventPath(data.value.event.id, 'transactions', id.value), { replace: true })
}

const trx = computed(() => data.value?.trx)
const methodText = computed(() => {
  const t = trx.value
  if (!t?.method) return null
  return t.method === 'virtual_account' && t.payment.channel ? `${t.payment.channel} virtual account` : `${PAYMENT_METHOD[t.method]}${t.payment.channel ? ` ${t.payment.channel}` : ''}`
})

const subtitle = computed(() => {
  const t = trx.value
  if (!t) return ''
  if (t.status === 'paid' && t.paidAt) return `Paid on ${formatDateWithDay(t.paidAt)} at ${formatTime(t.paidAt)} WIB${methodText.value ? ` by ${methodText.value}` : ''}`
  if (t.status === 'pending' && t.expiresAt) return `Awaiting payment until ${formatDateTime(t.expiresAt)} WIB`
  if (t.status === 'expired') return 'The invoice expired before it was paid'
  if (t.status === 'refunded' && t.payment.refundedAt) return `Refunded on ${formatDateTime(t.payment.refundedAt)} WIB`
  return ''
})

const payInfo = computed(() => {
  const t = trx.value
  if (!t) return []
  return ([
    ['Method', methodText.value],
    ['VA number', t.payment.vaNumber],
    ['DOKU reference', t.payment.dokuReference],
    ['Payment link', t.payment.dokuPaymentUrl],
    ['Invoice created', `${formatDateTime(t.createdAt)} WIB`],
    ['Payment deadline', t.expiresAt ? `${formatDateTime(t.expiresAt)} WIB` : null],
    ['Paid', t.paidAt ? `${formatDateTime(t.paidAt)} WIB` : null],
    ['Refund amount', t.payment.refundAmount != null ? formatRupiah(t.payment.refundAmount) : null],
    ['Admin note', t.payment.adminNote]
  ] as [string, string | null | undefined][]).filter(([, v]) => v)
})

const ICON: Record<string, string> = {
  created: 'i-lucide-file-text', invoice_sent: 'i-lucide-mail', paid: 'i-lucide-check', ticket_sent: 'i-lucide-send',
  expired: 'i-lucide-clock-alert', refunded: 'i-lucide-rotate-ccw', note: 'i-lucide-sticky-note'
}
const timeline = computed<TimelineItem[]>(() => [...(trx.value?.history ?? [])].reverse().map(h => ({
  title: HISTORY_LABEL[h.type],
  description: [formatDateTime(h.at), h.description, h.actor ? `by ${h.actor.name}` : null].filter(Boolean).join(' · '),
  icon: ICON[h.type]
})))

const refundOpen = ref(false)
const refunding = ref(false)
async function doRefund() {
  refunding.value = true
  try {
    await $fetch(`/api/admin/transactions/${id.value}/refund`, { method: 'POST', body: {} })
    notify.success('Refund processed', 'The registration is cancelled and the participant got a refund email.')
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
  <div v-if="error" class="rounded-md border border-default bg-default p-10">
    <UEmpty icon="i-lucide-receipt" title="Transaction not found" :actions="[{ label: 'Back to transactions', to: eventPath(eventId, 'transactions') }]" />
  </div>

  <template v-else-if="trx && data">
    <AdminPageHeader :title="trx.invoiceNo" :description="subtitle" :breadcrumb="[{ label: 'Transactions', to: eventPath(eventId, 'transactions') }, { label: trx.invoiceNo }]">
      <template #badges>
        <UBadge v-bind="TRANSACTION_STATUS[trx.status]" size="lg" />
      </template>
      <template #actions>
        <UButton v-if="trx.status === 'paid'" color="error" variant="outline" icon="i-lucide-rotate-ccw" label="Process refund" @click="refundOpen = true" />
      </template>
    </AdminPageHeader>

    <div class="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div class="flex flex-col gap-6">
        <AdminPanel title="Invoice details">
          <UTable
            :data="trx.items.lines"
            :columns="[{ id: 'item', header: 'Item' }, { id: 'qty', header: 'Qty' }, { id: 'price', header: 'Price' }, { id: 'subtotal', header: 'Subtotal' }]"
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
            <dt class="text-muted">Discount</dt>
            <dd class="text-right tabular-nums">{{ formatRupiah(trx.items.discount) }}</dd>
            <dt class="border-t border-default pt-2 font-semibold">{{ trx.status === 'paid' || trx.status === 'refunded' ? 'Total paid' : 'Total' }}</dt>
            <dd class="border-t border-default pt-2 text-right font-bold tabular-nums">{{ formatRupiah(trx.total) }}</dd>
          </dl>
          <p v-if="trx.items.fx" class="ml-auto max-w-xs text-right text-[13px]/[18px] text-muted">
            Priced at {{ formatMoney(trx.items.fx.total, trx.items.fx.currency) }}, charged in rupiah at
            {{ formatRate(trx.items.fx.currency, trx.items.fx.rateIdr) }} (rate of {{ formatDateTime(trx.items.fx.rateAt) }}), rounded up to the next rupiah.
          </p>
        </AdminPanel>

        <AdminPanel title="Payment details">
          <dl class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3 text-sm">
            <template v-for="[k, v] in payInfo" :key="k">
              <dt class="text-muted">{{ k }}</dt>
              <dd class="break-all font-medium text-highlighted">
                <a v-if="k === 'Payment link'" :href="v!" target="_blank" rel="noopener" class="text-primary hover:underline">{{ v }}</a>
                <template v-else>{{ v }}</template>
              </dd>
            </template>
          </dl>
        </AdminPanel>
      </div>

      <div class="flex flex-col gap-6">
        <AdminPanel title="Participant">
          <div class="flex items-center gap-3">
            <UAvatar :text="initials(trx.participantName)" class="bg-brand-50 text-brand-900" />
            <div class="min-w-0">
              <NuxtLink v-if="data.user && can('registrations.manage')" :to="eventPath(eventId, 'registrations', data.user.id)" class="font-semibold text-highlighted hover:underline">{{ trx.participantName }}</NuxtLink>
              <span v-else class="font-semibold text-highlighted">{{ trx.participantName }}</span>
              <div class="truncate text-xs text-muted">{{ trx.participantEmail }}</div>
            </div>
          </div>
          <dl class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3 text-sm">
            <dt class="text-muted">Organization</dt>
            <dd class="font-medium">{{ data.user?.organization ?? '—' }}</dd>
            <dt class="text-muted">Phone</dt>
            <dd class="font-medium">{{ data.user?.phone ?? '—' }}</dd>
            <dt class="text-muted">Event</dt>
            <dd class="font-medium">
              <NuxtLink v-if="data.event?.id && can('events.manage')" :to="eventPath(data.event.id, 'settings')" class="text-primary hover:underline">{{ trx.eventName }}</NuxtLink>
              <template v-else>{{ trx.eventName }}</template>
            </dd>
            <dt class="text-muted">Registration</dt>
            <dd class="font-mono text-[13px]">{{ data.regNo ?? 'Deleted' }}</dd>
          </dl>
          <UButton v-if="data.user && can('registrations.manage')" :to="eventPath(eventId, 'registrations', data.user.id)" color="neutral" variant="outline" block label="View participant profile" />
        </AdminPanel>

        <AdminPanel title="Status history">
          <UTimeline :items="timeline" :default-value="0" size="xs" />
        </AdminPanel>
      </div>
    </div>

    <AdminConfirmDialog
      v-model:open="refundOpen"
      :title="`Refund ${formatRupiah(trx.total)}?`"
      :description="`${trx.participantName}'s e-ticket for ${trx.eventName} is cancelled and the registration becomes Cancelled. The money goes back to the original payment method within 7–14 working days. This cannot be undone.`"
      confirm-label="Process refund"
      icon="i-lucide-rotate-ccw"
      :loading="refunding"
      @confirm="doRefund"
    />
  </template>
</template>
