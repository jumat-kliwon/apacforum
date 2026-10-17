<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({ layout: 'admin', middleware: 'admin', permission: 'access.manage' })

const notify = useNotify()
const { access, can } = useAdminAccess()
const { data, status, refresh } = await useFetch('/api/admin/access/roles')

type Row = NonNullable<typeof data.value>['roles'][number]
const columns: TableColumn<Row>[] = [
  { id: 'name', header: 'Role' },
  { id: 'permissions', header: 'Permissions' },
  { id: 'users', header: 'People' },
  { id: 'actions', header: () => h('span', { class: 'sr-only' }, 'Actions') }
]

/** Same rules as the API: no system roles, not your own role, nothing beyond your own permissions. */
function lockReason(r: Row) {
  if (r.isSystem) return 'System role'
  if (r.key === access.value?.role.key) return 'Your own role'
  if (access.value?.role.key !== SUPERADMIN_ROLE && !r.permissions.every(p => can(p))) return 'Has permissions you do not have'
  return null
}

// ── delete ──
const target = ref<Row | null>(null)
const deleting = ref(false)
async function remove() {
  if (!target.value) return
  deleting.value = true
  try {
    await $fetch(`/api/admin/access/roles/${target.value.id}`, { method: 'DELETE' })
    notify.success('Role deleted')
    target.value = null
    await refresh()
  } catch (err) {
    notify.error(err)
  } finally {
    deleting.value = false
  }
}
const deleteOpen = computed({ get: () => !!target.value, set: (v) => { if (!v) target.value = null } })
</script>

<template>
  <AdminPageHeader title="Roles" description="What each role may see and do in the CMS. Every user has one role.">
    <template #actions>
      <UButton to="/admin/access/roles/new" icon="i-lucide-plus" label="Add role" />
    </template>
  </AdminPageHeader>

  <AdminPanel>
    <UTable :data="data?.roles ?? []" :columns="columns" :loading="status === 'pending'" :ui="{ loading: 'p-0' }" empty="No roles yet." class="-mx-4 sm:-mx-5">
      <template #loading>
        <AdminSkeletonRows :rows="4" :columns="3" />
      </template>
      <template #name-cell="{ row }">
        <div class="flex min-w-0 flex-col">
          <span class="flex items-center gap-2">
            <NuxtLink v-if="!lockReason(row.original)" :to="`/admin/access/roles/${row.original.id}`" class="font-semibold text-highlighted hover:underline">{{ row.original.name }}</NuxtLink>
            <span v-else class="font-semibold text-highlighted">{{ row.original.name }}</span>
            <UBadge v-if="row.original.isSystem" color="neutral" variant="subtle" size="sm" icon="i-lucide-lock" label="System" />
          </span>
          <span class="max-w-sm truncate text-xs text-muted">{{ row.original.description }}</span>
        </div>
      </template>
      <template #permissions-cell="{ row }">
        <span v-if="row.original.key === SUPERADMIN_ROLE" class="text-sm font-medium">All permissions</span>
        <div v-else-if="row.original.permissions.length" class="flex max-w-xl flex-wrap gap-1">
          <UBadge v-for="p in row.original.permissions" :key="p" color="neutral" variant="outline" size="sm" :label="isPermission(p) ? PERMISSIONS[p].label : p" />
        </div>
        <span v-else class="text-sm text-muted">None — no CMS access</span>
      </template>
      <template #users-cell="{ row }">
        <NuxtLink :to="{ path: '/admin/access/users', query: { role: row.original.key } }" class="tabular-nums hover:underline">
          {{ formatNumber(row.original.users) }}
        </NuxtLink>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex items-center justify-end gap-1">
          <UTooltip v-if="lockReason(row.original)" :text="lockReason(row.original)!">
            <UIcon name="i-lucide-lock" class="size-4 text-dimmed" />
          </UTooltip>
          <template v-else>
            <UButton :to="`/admin/access/roles/${row.original.id}`" size="sm" color="neutral" variant="outline" icon="i-lucide-pencil" :aria-label="`Edit ${row.original.name}`" />
            <UButton size="sm" color="error" variant="ghost" icon="i-lucide-trash-2" :aria-label="`Delete ${row.original.name}`" @click="target = row.original" />
          </template>
        </div>
      </template>
    </UTable>
  </AdminPanel>

  <AdminConfirmDialog
    v-model:open="deleteOpen"
    :title="`Delete the “${target?.name ?? ''}” role?`"
    :description="target?.users ? `${target.users} user(s) still have this role. Give them another role first.` : 'The role and its permissions are removed. This cannot be undone.'"
    confirm-label="Delete role"
    :loading="deleting"
    @confirm="remove"
  />
</template>
