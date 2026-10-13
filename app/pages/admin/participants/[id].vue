<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'
import { profileSchema, rejectSchema } from '~~/shared/schemas/participant'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const notify = useNotify()
const id = computed(() => String(route.params.id))
const { data, error, refresh } = await useFetch(() => `/api/admin/users/${id.value}`)

const user = computed(() => data.value?.user)
const latestType = computed(() => data.value?.registrations[0]?.ticketTypeName)

const info = computed(() => {
  const u = user.value
  if (!u) return []
  return [
    ['Email', u.email],
    ['Phone', u.phone],
    ['Organization', u.organization],
    ['Job title', u.jobTitle],
    ['Country', u.country ? (COUNTRIES[u.country as keyof typeof COUNTRIES] ?? u.country) : null],
    ['City', u.city],
    ['T-shirt size', u.tshirtSize],
    ['Meal preference', u.mealPreference],
    ['Heard about us from', u.referralSource]
  ] as [string, string | null][]
})

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

const tickets = computed(() => data.value?.registrations.filter(r => r.ticketCode && r.ticketQr) ?? [])
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
  const reg = data.value?.registrations[0]
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
    await navigateTo('/admin/participants')
  } catch (err) {
    notify.error(err)
    deleting.value = false
  }
}

const methodText = (method: keyof typeof PAYMENT_METHOD | null, channel: string | null) =>
  method ? (method === 'virtual_account' && channel ? `VA ${channel}` : PAYMENT_METHOD[method]) : '—'
</script>

<template>
  <div v-if="error" class="rounded-md border border-default bg-default p-10">
    <UEmpty icon="i-lucide-user-x" title="Participant not found" :actions="[{ label: 'Back to participants', to: '/admin/participants' }]" />
  </div>

  <template v-else-if="user && data">
    <AdminPageHeader :title="user.name" :breadcrumb="[{ label: 'Participants', to: '/admin/participants' }, { label: user.name }]">
      <template #badges>
        <UBadge v-if="latestType" color="neutral" variant="outline" :label="latestType" />
      </template>
      <template #description>
        Registered since {{ formatDate(user.createdAt) }} · {{ data.registrations.length }} event {{ data.registrations.length === 1 ? 'registration' : 'registrations' }}
      </template>
      <template #actions>
        <UButton color="error" variant="ghost" icon="i-lucide-trash-2" label="Delete" @click="deleteOpen = true" />
        <UButton color="neutral" variant="outline" icon="i-lucide-mail" label="Send email" :disabled="!data.registrations.length" :loading="working?.startsWith('resend')" @click="sendEmail" />
        <UButton icon="i-lucide-pencil" label="Edit participant" @click="openEdit" />
      </template>
    </AdminPageHeader>

    <div class="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <AdminPanel>
        <div class="flex items-center gap-3">
          <UAvatar :text="initials(user.name)" size="lg" class="bg-brand-100 text-brand-900" />
          <div>
            <h2 class="text-base font-semibold text-highlighted">
              Participant details
            </h2>
            <p class="text-[13px] text-muted">
              Filled in by the participant on the registration form
            </p>
          </div>
        </div>
        <dl class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3 text-sm">
          <template v-for="[k, v] in info" :key="k">
            <dt class="text-muted">
              {{ k }}
            </dt>
            <dd class="break-words font-medium text-highlighted">
              {{ v || '—' }}
            </dd>
          </template>
        </dl>
      </AdminPanel>

      <div class="flex flex-col gap-6">
        <AdminPanel title="Registered events">
          <template #actions>
            <span class="text-[13px] text-muted">{{ data.registrations.length }} {{ data.registrations.length === 1 ? 'event' : 'events' }}</span>
          </template>
          <UTable
            :data="data.registrations"
            :columns="[{ id: 'event', header: 'Event' }, { id: 'no', header: 'Registration no.' }, { id: 'reg', header: 'Registration status' }, { id: 'pay', header: 'Payment status' }, { id: 'actions', header: 'Actions' }]"
            empty="No registrations yet."
            class="-mx-4 sm:-mx-5"
          >
            <template #event-cell="{ row }">
              <NuxtLink :to="`/admin/events/${row.original.eventId}`" class="font-semibold text-highlighted hover:underline">
                {{ row.original.eventName }}
              </NuxtLink>
              <div class="text-xs text-muted">
                {{ formatDateRange(row.original.startDate, row.original.endDate, 'short') }} · {{ row.original.ticketTypeName }}
              </div>
            </template>
            <template #no-cell="{ row }">
              <span class="font-mono text-[13px]">{{ row.original.regNo }}</span>
            </template>
            <template #reg-cell="{ row }">
              <UBadge v-bind="REGISTRATION_STATUS[row.original.status]" />
              <p v-if="row.original.rejectionReason" class="mt-1 max-w-56 text-xs text-muted">
                {{ row.original.rejectionReason }}
              </p>
            </template>
            <template #pay-cell="{ row }">
              <UBadge v-bind="paymentStatusLabel(row.original.paymentStatus, row.original.status)" />
            </template>
            <template #actions-cell="{ row }">
              <div class="flex flex-wrap gap-2">
                <template v-if="row.original.status === 'pending_verification'">
                  <UButton size="sm" color="error" variant="outline" label="Reject" @click="rejectTarget = { id: row.original.id, eventName: row.original.eventName }" />
                  <UButton size="sm" label="Verify" :loading="working === `verify:${row.original.id}`" @click="act(row.original.id, 'verify', 'Registration verified and invoice sent')" />
                </template>
                <UButton
                  v-if="row.original.ticketCode && row.original.paymentStatus === 'paid'"
                  size="sm"
                  color="neutral"
                  variant="outline"
                  icon="i-lucide-send"
                  label="Resend e-ticket"
                  :loading="working === `resend:${row.original.id}`"
                  @click="act(row.original.id, 'resend', 'E-ticket sent again')"
                />
              </div>
            </template>
          </UTable>
        </AdminPanel>

        <AdminPanel v-if="tickets.length" title="E-tickets" description="The same QR code the participant received by email. The registration desk scans it with the event's scanner link.">
          <div class="grid gap-4 sm:grid-cols-2">
            <article v-for="t in tickets" :key="t.id" class="flex gap-4 rounded-sm border border-default p-4">
              <img :src="t.ticketQr!" :alt="`QR code for ticket ${t.ticketCode}`" width="128" height="128" class="size-32 shrink-0 rounded-sm border border-default bg-white" :class="{ 'opacity-40 grayscale': !ticketValid(t) }">
              <div class="flex min-w-0 flex-col gap-1.5">
                <p class="font-mono text-sm font-medium text-highlighted">
                  {{ t.ticketCode }}
                </p>
                <p class="truncate text-[13px] text-muted">
                  {{ t.eventName }} · {{ t.ticketTypeName }}
                </p>
                <div>
                  <UBadge v-if="!ticketValid(t)" color="neutral" variant="subtle" icon="i-lucide-ban" label="No longer valid" />
                  <UBadge v-else-if="t.checkedInAt" color="success" variant="subtle" icon="i-lucide-circle-check" :label="`Checked in ${formatDateTime(t.checkedInAt)}`" />
                  <UBadge v-else color="info" variant="subtle" icon="i-lucide-ticket" label="Not checked in yet" />
                </div>
                <div class="mt-auto flex flex-wrap gap-2 pt-1">
                  <UButton :to="t.ticketQr!" :download="`${t.ticketCode}.png`" external size="xs" color="neutral" variant="outline" icon="i-lucide-download" label="Download QR" />
                  <UButton
                    v-if="t.checkedInAt"
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-undo-2"
                    label="Undo check-in"
                    :loading="working === `undo:${t.id}`"
                    @click="undoCheckIn(t.id)"
                  />
                </div>
              </div>
            </article>
          </div>
        </AdminPanel>

        <AdminPanel title="Transaction history">
          <template #actions>
            <span class="text-[13px] text-muted">Total paid <strong class="text-highlighted">{{ formatRupiah(data.totalPaid) }}</strong></span>
          </template>
          <UTable
            :data="data.transactions"
            :columns="[{ id: 'id', header: 'Transaction ID' }, { id: 'event', header: 'Event' }, { id: 'amount', header: 'Amount' }, { id: 'method', header: 'Method' }, { id: 'status', header: 'Status' }, { id: 'date', header: 'Date' }, { id: 'actions', header: 'Actions' }]"
            empty="No transactions yet."
            class="-mx-4 sm:-mx-5"
          >
            <template #id-cell="{ row }">
              <NuxtLink :to="`/admin/transactions/${row.original.id}`" class="font-mono text-[13px] font-medium text-primary hover:underline">
                {{ row.original.invoiceNo }}
              </NuxtLink>
            </template>
            <template #event-cell="{ row }">
              {{ row.original.eventName }}
            </template>
            <template #amount-cell="{ row }">
              <span class="tabular-nums">{{ formatRupiah(row.original.total) }}</span>
            </template>
            <template #method-cell="{ row }">
              <span class="text-muted">{{ methodText(row.original.method, row.original.channel) }}</span>
            </template>
            <template #status-cell="{ row }">
              <UBadge v-bind="TRANSACTION_STATUS[row.original.status]" />
            </template>
            <template #date-cell="{ row }">
              <span class="whitespace-nowrap text-muted tabular-nums">{{ formatDateTime(row.original.createdAt) }}</span>
            </template>
            <template #actions-cell="{ row }">
              <UButton :to="`/admin/transactions/${row.original.id}`" size="sm" color="neutral" variant="ghost" label="Details" />
            </template>
          </UTable>
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
