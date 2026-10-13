<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import { profileSchema, rejectSchema } from '~~/shared/schemas/participant'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const notify = useNotify()
const id = computed(() => String(route.params.id))
const { data, error, refresh } = await useFetch(() => `/api/admin/users/${id.value}`)

const user = computed(() => data.value?.user)
const latestType = computed(() => data.value?.registrations[0]?.ticketTypeName)

const COUNTRIES: Record<string, string> = { ID: 'Indonesia', MY: 'Malaysia', SG: 'Singapura', TH: 'Thailand', VN: 'Vietnam', PH: 'Filipina', BN: 'Brunei', KH: 'Kamboja', LA: 'Laos', MM: 'Myanmar', TL: 'Timor-Leste' }
const info = computed(() => {
  const u = user.value
  if (!u) return []
  return [
    ['Email', u.email],
    ['No. telepon', u.phone],
    ['Instansi', u.organization],
    ['Jabatan', u.jobTitle],
    ['Negara', u.country ? (COUNTRIES[u.country] ?? u.country) : null],
    ['Kota', u.city],
    ['Ukuran kaos', u.tshirtSize],
    ['Preferensi makan', u.mealPreference],
    ['Sumber info', u.referralSource]
  ] as [string, string | null][]
})

// ── aksi per pendaftaran ──
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
    notify.success('Pendaftaran ditolak', 'Email pemberitahuan dikirim ke peserta.')
    rejectTarget.value = null
    rejectState.reason = ''
    await refresh()
  } catch (err) {
    notify.error(err)
  } finally {
    working.value = null
  }
}

async function sendEmail() {
  const reg = data.value?.registrations[0]
  if (reg) await act(reg.id, 'resend', 'Email status pendaftaran terkirim')
}

// ── edit ──
const editSchema = profileSchema.extend({ email: z.email('Email tidak valid') })
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
    notify.success('Data peserta disimpan')
    editOpen.value = false
    await refresh()
  } catch (err) {
    notify.error(err)
  } finally {
    saving.value = false
  }
}
const countryItems = Object.entries(COUNTRIES).map(([value, label]) => ({ value, label }))

// ── hapus ──
const deleteOpen = ref(false)
const deleting = ref(false)
async function remove() {
  deleting.value = true
  try {
    await $fetch(`/api/admin/users/${id.value}`, { method: 'DELETE' })
    notify.success('Peserta dihapus')
    await navigateTo('/admin/peserta')
  } catch (err) {
    notify.error(err)
    deleting.value = false
  }
}
</script>

<template>
  <div v-if="error" class="rounded-2xl border border-default bg-default p-10">
    <UEmpty icon="i-lucide-user-x" title="Peserta tidak ditemukan" :actions="[{ label: 'Kembali ke daftar peserta', to: '/admin/peserta' }]" />
  </div>

  <template v-else-if="user && data">
    <AdminPageHeader :title="user.name" :breadcrumb="[{ label: 'Peserta', to: '/admin/peserta' }, { label: user.name }]">
      <template #badges>
        <UBadge v-if="latestType" color="neutral" variant="outline" :label="latestType" />
      </template>
      <template #description>
        Terdaftar sejak {{ formatDate(user.createdAt) }} · {{ data.registrations.length }} pendaftaran event
      </template>
      <template #actions>
        <UButton color="error" variant="ghost" icon="i-lucide-trash-2" label="Hapus" @click="deleteOpen = true" />
        <UButton color="neutral" variant="outline" icon="i-lucide-mail" label="Kirim email" :disabled="!data.registrations.length" :loading="working?.startsWith('resend')" @click="sendEmail" />
        <UButton icon="i-lucide-pencil" label="Edit data peserta" @click="openEdit" />
      </template>
    </AdminPageHeader>

    <div class="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <AdminPanel>
        <div class="flex items-center gap-3">
          <UAvatar :text="initials(user.name)" size="lg" class="bg-brand-100 text-brand-900" />
          <div>
            <h2 class="text-base font-semibold text-highlighted">
              Informasi peserta
            </h2>
            <p class="text-[13px] text-muted">
              Diisi peserta lewat form Registration
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
        <AdminPanel title="Event yang didaftar">
          <template #actions>
            <span class="text-[13px] text-muted">{{ data.registrations.length }} event</span>
          </template>
          <UTable
            :data="data.registrations"
            :columns="[{ id: 'event', header: 'Event' }, { id: 'no', header: 'No. pendaftaran' }, { id: 'reg', header: 'Status pendaftaran' }, { id: 'pay', header: 'Status pembayaran' }, { id: 'actions', header: 'Aksi' }]"
            empty="Belum ada pendaftaran."
            class="-mx-4 sm:-mx-5"
          >
            <template #event-cell="{ row }">
              <NuxtLink :to="`/admin/event/${row.original.eventId}`" class="font-semibold text-highlighted hover:underline">
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
                  <UButton size="sm" color="error" variant="outline" label="Tolak" @click="rejectTarget = { id: row.original.id, eventName: row.original.eventName }" />
                  <UButton size="sm" label="Verifikasi" :loading="working === `verify:${row.original.id}`" @click="act(row.original.id, 'verify', 'Pendaftaran terverifikasi, tagihan dikirim')" />
                </template>
                <UButton
                  v-if="row.original.ticketCode && row.original.paymentStatus === 'paid'"
                  size="sm"
                  color="neutral"
                  variant="outline"
                  icon="i-lucide-send"
                  label="Kirim ulang e-tiket"
                  :loading="working === `resend:${row.original.id}`"
                  @click="act(row.original.id, 'resend', 'E-tiket dikirim ulang')"
                />
              </div>
            </template>
          </UTable>
        </AdminPanel>

        <AdminPanel title="Riwayat transaksi">
          <template #actions>
            <span class="text-[13px] text-muted">Total dibayar <strong class="text-highlighted">{{ formatRupiah(data.totalPaid) }}</strong></span>
          </template>
          <UTable
            :data="data.transactions"
            :columns="[{ id: 'id', header: 'ID transaksi' }, { id: 'event', header: 'Event' }, { id: 'amount', header: 'Jumlah' }, { id: 'method', header: 'Metode' }, { id: 'status', header: 'Status' }, { id: 'date', header: 'Tanggal' }, { id: 'actions', header: 'Aksi' }]"
            empty="Belum ada transaksi."
            class="-mx-4 sm:-mx-5"
          >
            <template #id-cell="{ row }">
              <NuxtLink :to="`/admin/transaksi/${row.original.id}`" class="font-mono text-[13px] font-medium text-primary hover:underline">
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
              <span class="text-muted">{{ row.original.method ? (row.original.method === 'virtual_account' && row.original.channel ? `VA ${row.original.channel}` : PAYMENT_METHOD[row.original.method]) : '—' }}</span>
            </template>
            <template #status-cell="{ row }">
              <UBadge v-bind="TRANSACTION_STATUS[row.original.status]" />
            </template>
            <template #date-cell="{ row }">
              <span class="whitespace-nowrap text-muted">{{ formatDateTime(row.original.createdAt) }}</span>
            </template>
            <template #actions-cell="{ row }">
              <UButton :to="`/admin/transaksi/${row.original.id}`" size="sm" color="neutral" variant="ghost" label="Detail" />
            </template>
          </UTable>
        </AdminPanel>
      </div>
    </div>

    <AdminConfirmDialog
      v-model:open="deleteOpen"
      :title="`Hapus peserta ${user.name}?`"
      :description="`${data.registrations.length} pendaftaran event dan e-tiketnya ikut terhapus. Riwayat transaksi tetap tersimpan untuk laporan keuangan. Tindakan ini tidak bisa dibatalkan.`"
      confirm-label="Hapus peserta"
      :loading="deleting"
      @confirm="remove"
    />

    <UModal :open="!!rejectTarget" :title="`Tolak pendaftaran ${rejectTarget?.eventName ?? ''}?`" description="Alasan dikirim ke peserta lewat email." @update:open="v => { if (!v) rejectTarget = null }">
      <template #body>
        <UForm id="reject-form" :schema="rejectSchema" :state="rejectState" @submit="submitReject">
          <UFormField label="Alasan penolakan" name="reason">
            <UTextarea v-model="rejectState.reason" :rows="3" placeholder="Contoh: dokumen surat tugas instansi belum dilampirkan." class="w-full" autofocus />
          </UFormField>
        </UForm>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="outline" label="Batalkan" @click="rejectTarget = null" />
          <UButton type="submit" form="reject-form" color="error" label="Tolak pendaftaran" :loading="working?.startsWith('reject')" />
        </div>
      </template>
    </UModal>

    <UModal v-model:open="editOpen" title="Edit data peserta" :ui="{ content: 'max-w-2xl' }">
      <template #body>
        <UForm id="edit-form" :schema="editSchema" :state="editState" class="grid gap-4 sm:grid-cols-2" @submit="submitEdit">
          <UFormField label="Nama lengkap" name="name" class="sm:col-span-2">
            <UInput v-model="editState.name!" class="w-full" />
          </UFormField>
          <UFormField label="Email" name="email">
            <UInput v-model="editState.email!" type="email" class="w-full" />
          </UFormField>
          <UFormField label="No. telepon" name="phone">
            <UInput v-model="editState.phone!" type="tel" class="w-full" />
          </UFormField>
          <UFormField label="Instansi" name="organization">
            <UInput v-model="editState.organization!" class="w-full" />
          </UFormField>
          <UFormField label="Jabatan" name="jobTitle">
            <UInput v-model="editState.jobTitle!" class="w-full" />
          </UFormField>
          <UFormField label="Negara" name="country">
            <USelect v-model="editState.country!" :items="countryItems" class="w-full" />
          </UFormField>
          <UFormField label="Kota" name="city">
            <UInput v-model="editState.city!" class="w-full" />
          </UFormField>
          <UFormField label="Ukuran kaos" name="tshirtSize">
            <USelect v-model="editState.tshirtSize!" :items="[...TSHIRT_SIZES]" placeholder="Pilih ukuran" class="w-full" />
          </UFormField>
          <UFormField label="Preferensi makan" name="mealPreference">
            <UInput v-model="editState.mealPreference!" class="w-full" />
          </UFormField>
          <UFormField label="Sumber info" name="referralSource" class="sm:col-span-2">
            <UInput v-model="editState.referralSource!" class="w-full" />
          </UFormField>
        </UForm>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="outline" label="Batalkan" @click="editOpen = false" />
          <UButton type="submit" form="edit-form" label="Simpan" :loading="saving" />
        </div>
      </template>
    </UModal>
  </template>
</template>
