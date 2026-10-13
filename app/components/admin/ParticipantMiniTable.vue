<script setup lang="ts">
type Row = {
  id: string
  userId: string
  name: string
  organization: string | null
  ticketTypeName: string
  status: keyof typeof REGISTRATION_STATUS
  paymentStatus: keyof typeof PAYMENT_STATUS
  createdAt: string | Date
}
defineProps<{ rows: Row[] }>()

const columns = [
  { accessorKey: 'name', header: 'Participant' },
  { accessorKey: 'ticketTypeName', header: 'Participant type' },
  { accessorKey: 'status', header: 'Registration status' },
  { accessorKey: 'paymentStatus', header: 'Payment status' },
  { accessorKey: 'createdAt', header: 'Registered' }
]
</script>

<template>
  <UTable :data="rows" :columns="columns" empty="No registrations yet." class="-mx-4 sm:-mx-5">
    <template #name-cell="{ row }">
      <NuxtLink :to="`/admin/participants/${row.original.userId}`" class="flex items-center gap-3">
        <UAvatar :text="initials(row.original.name)" size="sm" class="bg-brand-50 text-brand-900" />
        <div class="min-w-0">
          <div class="font-medium text-highlighted">{{ row.original.name }}</div>
          <div class="text-xs text-muted">{{ row.original.organization }}</div>
        </div>
      </NuxtLink>
    </template>
    <template #ticketTypeName-cell="{ row }">
      <UBadge color="neutral" variant="outline" :label="row.original.ticketTypeName" />
    </template>
    <template #status-cell="{ row }">
      <UBadge v-bind="REGISTRATION_STATUS[row.original.status]" />
    </template>
    <template #paymentStatus-cell="{ row }">
      <UBadge v-bind="paymentStatusLabel(row.original.paymentStatus, row.original.status)" />
    </template>
    <template #createdAt-cell="{ row }">
      <span class="text-muted">{{ formatDateTime(row.original.createdAt) }}</span>
    </template>
  </UTable>
</template>
