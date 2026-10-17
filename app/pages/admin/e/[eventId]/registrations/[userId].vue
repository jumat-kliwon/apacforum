<script setup lang="ts">
import type { DropdownMenuItem, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'
import { profileSchema, rejectSchema } from '~~/shared/schemas/participant'
import type { Outcome } from '~/utils/registrationProgress'

definePageMeta({ layout: 'admin', middleware: 'admin', permission: 'registrations.manage' })

const route = useRoute()
const notify = useNotify()
const eventId = useEventId()
const { can } = useAdminAccess()
const id = computed(() => String(route.params.userId))
const { data, error, refresh } = await useFetch(() => `/api/admin/users/${id.value}`)

const user = computed(() => data.value?.user)
const here = computed(() => data.value?.registrations.filter(r => r.eventId === eventId) ?? [])
const elsewhere = computed(() => data.value?.registrations.filter(r => r.eventId !== eventId) ?? [])
const latestType = computed(() => here.value[0]?.ticketTypeName)

// the URL's event must be one they registered for; otherwise open their latest registration's event
const latest = data.value?.registrations[0]
if (latest && !here.value.length) await navigateTo(eventPath(latest.eventId, 'registrations', id.value), { replace: true })

// ── this event's registration: where it stands and what to do next ──
const reg = computed(() => here.value[0])
/** Its invoices, newest first. */
const regTrx = computed(() => data.value?.transactions.filter(t => t.participantId === reg.value?.id) ?? [])
const invoice = computed(() => regTrx.value[0])
const progress = computed(() => reg.value
  ? registrationProgress({ ...reg.value, paidAt: regTrx.value.find(t => t.paidAt)?.paidAt ?? null })
  : null)

const NEXT_ICON: Record<Outcome, { icon: string, class: string }> = {
  'review': { icon: 'i-lucide-user-check', class: 'text-warning' },
  'awaiting-invoice': { icon: 'i-lucide-file-clock', class: 'text-warning' },
  'awaiting-payment': { icon: 'i-lucide-clock', class: 'text-warning' },
  'paid': { icon: 'i-lucide-ticket', class: 'text-info' },
  'ticket-issued': { icon: 'i-lucide-scan-line', class: 'text-success' },
  'checked-in': { icon: 'i-lucide-circle-check', class: 'text-success' },
  'rejected': { icon: 'i-lucide-circle-x', class: 'text-error' },
  'expired': { icon: 'i-lucide-clock-alert', class: 'text-error' },
  'cancelled': { icon: 'i-lucide-ban', class: 'text-muted' }
}
/** Headline and detail of the next-step box. */
const next = computed(() => {
  const r = reg.value
  const p = progress.value
  const inv = invoice.value
  if (!r || !p) return null
  const at = (d: string | Date | null | undefined) => (d ? `${formatDateTime(d)} WIB` : null)
  const text: Record<Outcome, [string, string | null]> = {
    'review': ['Waiting for verification', 'Check the details, then verify or reject with a reason.'],
    'awaiting-invoice': ['Verified, no invoice yet', 'The invoice is emailed once it is created.'],
    'awaiting-payment': [`Waiting for payment of ${inv ? formatRupiah(inv.total) : 'the invoice'}`, [inv?.invoiceNo, inv?.expiresAt && `due ${at(inv.expiresAt)}`].filter(Boolean).join(' · ') || null],
    'paid': ['Paid, e-ticket not issued yet', inv?.paidAt ? `Paid ${at(inv.paidAt)}` : null],
    'ticket-issued': ['Ready for check-in', `E-ticket ${r.ticketCode}`],
    'checked-in': ['Checked in', at(r.checkedInAt)],
    'rejected': ['Registration rejected', r.rejectionReason],
    'expired': ['Invoice expired before it was paid', inv?.expiresAt ? `Expired ${at(inv.expiresAt)}` : null],
    'cancelled': [r.paymentStatus === 'refunded' ? 'Cancelled and refunded' : 'Registration cancelled', at(r.cancelledAt)]
  }
  const [title, detail] = text[p.outcome]
  return { title, detail, ...NEXT_ICON[p.outcome] }
})

// rare or destructive actions live behind the ⋯ menu
const menu = computed<DropdownMenuItem[][]>(() => [
  [{ label: 'Send status email', icon: 'i-lucide-mail', disabled: !here.value.length, onSelect: sendEmail }],
  [{ label: 'Delete participant', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => { deleteOpen.value = true } }]
])

// ── per-registration actions ──
const working = ref<string | null>(null)
async function act(regId: string, action: 'verify' | 'resend', okText: string) {
  working.value = `${action}:${regId}`
  try {
    await $fetch(`/api/admin/registrations/${regId}/${action}`, { method: 'POST' })
    notify.success(okText)
    await refresh()
  } catch (err) {
    notify.error(err)
  } finally {
    working.value = null
  }
}

const rejectTarget = ref<{ id: string, eventName: string } | null>(null)
const rejectState = reactive({ reason: '' })
async function submitReject(e: FormSubmitEvent<z.output<typeof rejectSchema>>) {
  if (!rejectTarget.value) return
  working.value = `reject:${rejectTarget.value.id}`
  try {
    await $fetch(`/api/admin/registrations/${rejectTarget.value.id}/reject`, { method: 'POST', body: e.data })
    notify.success('Registration rejected', 'We emailed the participant.')
    rejectTarget.value = null
    rejectState.reason = ''
    await refresh()
  } catch (err) {
    notify.error(err)
  } finally {
    working.value = null
  }
}

const ticket = computed(() => (reg.value?.ticketCode && reg.value.ticketQr ? reg.value : null))
const ticketValid = (r: { status: string, paymentStatus: string }) => r.paymentStatus === 'paid' && r.status === 'verified'

async function undoCheckIn(regId: string) {
  working.value = `undo:${regId}`
  try {
    await $fetch(`/api/admin/registrations/${regId}/check-in`, { method: 'DELETE' })
    notify.success('Check-in undone', 'The ticket can be scanned again.')
    await refresh()
  } catch (err) {
    notify.error(err)
  } finally {
    working.value = null
  }
}

async function sendEmail() {
  const reg = here.value[0]
  if (reg) await act(reg.id, 'resend', 'Registration status email sent')
}

// ── edit ──
const editSchema = profileSchema.extend({ email: z.email('Enter a valid email') })
const editOpen = ref(false)
const editState = reactive<Record<string, string | null | undefined>>({})
function openEdit() {
  const u = user.value!
  Object.assign(editState, {
    name: u.name, email: u.email, phone: u.phone ?? '', organization: u.organization ?? '', jobTitle: u.jobTitle ?? '',
    country: u.country ?? 'ID', city: u.city ?? '', tshirtSize: u.tshirtSize ?? undefined, mealPreference: u.mealPreference ?? '', referralSource: u.referralSource ?? ''
  })
  editOpen.value = true
}
const saving = ref(false)
async function submitEdit(e: FormSubmitEvent<z.output<typeof editSchema>>) {
  saving.value = true
  try {
    await $fetch(`/api/admin/users/${id.value}`, { method: 'PUT', body: e.data })
    notify.success('Participant saved')
    editOpen.value = false
    await refresh()
  } catch (err) {
    notify.error(err)
  } finally {
    saving.value = false
  }
}
const countryItems = toItems(COUNTRIES)

// ── delete ──
const deleteOpen = ref(false)
const deleting = ref(false)
async function remove() {
  deleting.value = true
  try {
    await $fetch(`/api/admin/users/${id.value}`, { method: 'DELETE' })
    notify.success('Participant deleted')
    await navigateTo(eventPath(eventId, 'registrations'))
  } catch (err) {
    notify.error(err)
    deleting.value = false
  }
}

const methodText = (method: keyof typeof PAYMENT_METHOD | null, channel: string | null) =>
  method ? (method === 'virtual_account' && channel ? `VA ${channel}` : PAYMENT_METHOD[method]) : null
</script>

<template>
  <div v-if="error" class="rounded-md border border-default bg-default p-10">
    <UEmpty icon="i-lucide-user-x" title="Participant not found" :actions="[{ label: 'Back to participants', to: eventPath(eventId, 'registrations') }]" />
  </div>

  <template v-else-if="user && data">
    <AdminPageHeader :title="user.name" :breadcrumb="[{ label: 'Participants', to: eventPath(eventId, 'registrations') }, { label: user.name }]">
      <template #badges>
        <UBadge v-if="latestType" color="neutral" variant="outline" :label="latestType" />
      </template>
      <template #description>
        {{ [user.organization, user.email].filter(Boolean).join(' · ') }}
      </template>
      <template #actions>
        <UDropdownMenu :items="menu" :content="{ align: 'end' }">
          <UButton color="neutral" variant="outline" icon="i-lucide-ellipsis" aria-label="More actions" />
        </UDropdownMenu>
      </template>
    </AdminPageHeader>

    <div class="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div class="flex min-w-0 flex-col gap-6">
        <AdminPanel v-if="reg && progress && next">
          <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 class="text-base/6 font-semibold text-highlighted">
              Registration
            </h2>
            <span class="font-mono text-[13px] text-muted">{{ reg.regNo }}</span>
            <span class="text-[13px] text-muted sm:ml-auto">Registered {{ formatDateTime(reg.createdAt) }} WIB</span>
          </div>

          <AdminRegistrationProgress :steps="progress.steps" class="py-2" />

          <div class="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-md bg-muted p-4" role="status">
            <UIcon :name="next.icon" class="size-5 shrink-0" :class="next.class" />
            <div class="min-w-0 grow basis-48">
              <p class="font-semibold text-highlighted">
                {{ next.title }}
              </p>
              <p v-if="next.detail" class="break-words text-sm text-muted">
                {{ next.detail }}
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <template v-if="progress.outcome === 'review'">
                <UButton color="error" variant="outline" label="Reject" @click="rejectTarget = { id: reg.id, eventName: reg.eventName }" />
                <UButton icon="i-lucide-check" label="Verify" :loading="working === `verify:${reg.id}`" @click="act(reg.id, 'verify', 'Registration verified and invoice sent')" />
              </template>
              <template v-else-if="progress.outcome === 'awaiting-payment'">
                <UButton v-if="invoice && can('transactions.manage')" :to="eventPath(eventId, 'transactions', invoice.id)" color="neutral" variant="outline" label="View invoice" />
                <UButton icon="i-lucide-send" label="Resend invoice" :loading="working === `resend:${reg.id}`" @click="act(reg.id, 'resend', 'Invoice sent again')" />
              </template>
              <UButton v-else-if="progress.outcome === 'ticket-issued'" icon="i-lucide-send" label="Resend e-ticket" :loading="working === `resend:${reg.id}`" @click="act(reg.id, 'resend', 'E-ticket sent again')" />
              <UButton v-else-if="progress.outcome === 'checked-in'" color="neutral" variant="outline" icon="i-lucide-undo-2" label="Undo check-in" :loading="working === `undo:${reg.id}`" @click="undoCheckIn(reg.id)" />
              <UButton v-else color="neutral" variant="outline" icon="i-lucide-mail" label="Send status email" :loading="working === `resend:${reg.id}`" @click="act(reg.id, 'resend', 'Registration status email sent')" />
            </div>
          </div>
        </AdminPanel>

        <AdminPanel v-if="ticket" title="E-ticket" description="The same QR code the participant received by email. The registration desk scans it with the event's scanner link.">
          <div class="flex flex-wrap items-center gap-5">
            <img :src="ticket.ticketQr!" :alt="`QR code for ticket ${ticket.ticketCode}`" width="144" height="144" class="size-36 shrink-0 rounded-sm border border-default bg-white" :class="{ 'opacity-40 grayscale': !ticketValid(ticket) }">
            <div class="flex min-w-0 flex-col gap-2">
              <p class="font-mono text-base font-medium text-highlighted">
                {{ ticket.ticketCode }}
              </p>
              <p class="text-[13px] text-muted">
                {{ ticket.ticketTypeName }}
              </p>
              <div>
                <UBadge v-if="!ticketValid(ticket)" color="neutral" variant="subtle" icon="i-lucide-ban" label="No longer valid" />
                <UBadge v-else-if="ticket.checkedInAt" color="success" variant="subtle" icon="i-lucide-circle-check" :label="`Checked in ${formatDateTime(ticket.checkedInAt)}`" />
                <UBadge v-else color="info" variant="subtle" icon="i-lucide-ticket" label="Not checked in yet" />
              </div>
              <div class="pt-1">
                <UButton :to="ticket.ticketQr!" :download="`${ticket.ticketCode}.png`" external size="sm" color="neutral" variant="outline" icon="i-lucide-download" label="Download QR" />
              </div>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel title="Payments">
          <template #actions>
            <span class="text-[13px] text-muted">Total paid <strong class="text-highlighted">{{ formatRupiah(data.totalPaid) }}</strong></span>
          </template>
          <ul v-if="data.transactions.length" class="-mx-4 divide-y divide-default border-t border-default sm:-mx-5">
            <li v-for="t in data.transactions" :key="t.id" class="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 sm:px-5">
              <div class="flex min-w-0 grow basis-48 flex-col">
                <NuxtLink v-if="t.eventId && can('transactions.manage')" :to="eventPath(t.eventId, 'transactions', t.id)" class="font-mono text-[13px] font-medium text-primary hover:underline">
                  {{ t.invoiceNo }}
                </NuxtLink>
                <span v-else class="font-mono text-[13px] font-medium">{{ t.invoiceNo }}</span>
                <span class="text-xs text-muted">{{ [t.eventId !== eventId ? t.eventName : null, methodText(t.method, t.channel), formatDateTime(t.createdAt)].filter(Boolean).join(' · ') }}</span>
              </div>
              <span class="font-medium tabular-nums">{{ formatRupiah(t.total) }}</span>
              <UBadge v-bind="TRANSACTION_STATUS[t.status]" />
            </li>
          </ul>
          <p v-else class="text-sm text-muted">
            No transactions yet.
          </p>
        </AdminPanel>
      </div>

      <div class="flex min-w-0 flex-col gap-6">
        <AdminParticipantInfo :user="user" @edit="openEdit" />

        <AdminPanel v-if="elsewhere.length" title="Other events" description="Open a registration to manage it in its own event.">
          <ul class="-mx-4 divide-y divide-default border-t border-default sm:-mx-5">
            <li v-for="r in elsewhere" :key="r.id" class="flex flex-col gap-1.5 px-4 py-3 sm:px-5">
              <NuxtLink :to="eventPath(r.eventId, 'registrations', id)" class="font-semibold text-highlighted hover:underline">
                {{ r.eventName }}
              </NuxtLink>
              <span class="text-xs text-muted">{{ formatDateRange(r.startDate, r.endDate, 'short') }} · {{ r.regNo }}</span>
              <div class="flex flex-wrap gap-1.5">
                <UBadge v-bind="REGISTRATION_STATUS[r.status]" size="sm" />
                <UBadge v-bind="paymentStatusLabel(r.paymentStatus, r.status)" size="sm" />
              </div>
            </li>
          </ul>
        </AdminPanel>
      </div>
    </div>

    <AdminConfirmDialog
      v-model:open="deleteOpen"
      :title="`Delete participant ${user.name}?`"
      :description="`${data.registrations.length} event ${data.registrations.length === 1 ? 'registration' : 'registrations'} and their e-tickets are deleted too. Transaction history is kept for financial reporting. This cannot be undone.`"
      confirm-label="Delete participant"
      :loading="deleting"
      @confirm="remove"
    />

    <UModal :open="!!rejectTarget" :title="`Reject the ${rejectTarget?.eventName ?? ''} registration?`" description="We send the reason to the participant by email." @update:open="v => { if (!v) rejectTarget = null }">
      <template #body>
        <UForm id="reject-form" :schema="rejectSchema" :state="rejectState" @submit="submitReject">
          <UFormField label="Reason" name="reason">
            <UTextarea v-model="rejectState.reason" :rows="3" placeholder="For example: the assignment letter from your institution was not attached." class="w-full" autofocus />
          </UFormField>
        </UForm>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="outline" label="Cancel" @click="rejectTarget = null" />
          <UButton type="submit" form="reject-form" color="error" label="Reject registration" :loading="working?.startsWith('reject')" />
        </div>
      </template>
    </UModal>

    <UModal v-model:open="editOpen" title="Edit participant" :ui="{ content: 'max-w-2xl' }">
      <template #body>
        <UForm id="edit-form" :schema="editSchema" :state="editState" class="grid gap-5 sm:grid-cols-2" @submit="submitEdit">
          <UFormField label="Full name" name="name" class="sm:col-span-2">
            <UInput v-model="editState.name!" class="w-full" />
          </UFormField>
          <UFormField label="Email" name="email">
            <UInput v-model="editState.email!" type="email" class="w-full" />
          </UFormField>
          <UFormField label="Phone" name="phone">
            <UInput v-model="editState.phone!" type="tel" class="w-full" />
          </UFormField>
          <UFormField label="Organization" name="organization">
            <UInput v-model="editState.organization!" class="w-full" />
          </UFormField>
          <UFormField label="Job title" name="jobTitle">
            <UInput v-model="editState.jobTitle!" class="w-full" />
          </UFormField>
          <UFormField label="Country" name="country">
            <USelect v-model="editState.country!" :items="countryItems" class="w-full" />
          </UFormField>
          <UFormField label="City" name="city">
            <UInput v-model="editState.city!" class="w-full" />
          </UFormField>
          <UFormField label="T-shirt size" name="tshirtSize" hint="Optional">
            <USelect v-model="editState.tshirtSize!" :items="TSHIRT_ITEMS" placeholder="Choose a size" class="w-full" />
          </UFormField>
          <UFormField label="Meal preference" name="mealPreference" hint="Optional">
            <UInput v-model="editState.mealPreference!" class="w-full" />
          </UFormField>
          <UFormField label="Heard about us from" name="referralSource" hint="Optional" class="sm:col-span-2">
            <UInput v-model="editState.referralSource!" class="w-full" />
          </UFormField>
        </UForm>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="outline" label="Cancel" @click="editOpen = false" />
          <UButton type="submit" form="edit-form" label="Save" :loading="saving" />
        </div>
      </template>
    </UModal>
  </template>
</template>
