<script setup lang="ts">
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
import * as z from 'zod'
import { staffCreateSchema } from '~~/shared/schemas/access'

definePageMeta({ layout: 'admin', middleware: 'admin', permission: 'access.manage' })

const notify = useNotify()
const { access } = useAdminAccess()
const list = useListQuery({ sort: 'name', dir: 'asc', filters: { role: undefined } as Record<'role', string | undefined> })
const { q, page, pageSize, filters, query } = list
const { data, status, refresh } = await useFetch('/api/admin/access/users', { query, watch: [query] })
const tableSkeleton = useQuerySkeleton(status, query)
const { data: roleData } = await useFetch('/api/admin/access/roles')

type Row = NonNullable<typeof data.value>['rows'][number]
const columns: TableColumn<Row>[] = [
  { id: 'name', header: 'User' },
  { id: 'role', header: 'Role' },
  { id: 'status', header: 'Status' },
  { id: 'lastSeen', header: 'Last active' },
  { id: 'actions', header: () => h('span', { class: 'sr-only' }, 'Actions') }
]

const me = computed(() => access.value!)
const roles = computed(() => roleData.value?.roles ?? [])
const permissionsOf = (key: string) => roles.value.find(r => r.key === key)?.permissions ?? []
/** Roles you may hand out (the API checks the same). */
const roleItems = computed(() => roles.value
  .filter(r => canGrant({ role: me.value.role.key, permissions: me.value.permissions }, r.key, r.permissions))
  .map(r => ({ label: r.name, value: r.key, description: r.permissions.length ? undefined : 'No CMS access' })))
/** Whether you may manage this user: someone with permissions you lack is out of reach. */
const manageable = (r: Row) => r.id === me.value.user.id || canGrant({ role: me.value.role.key, permissions: me.value.permissions }, r.role, permissionsOf(r.role))

const ALL = '__all'
const roleFilter = computed({
  get: () => filters.role ?? ALL,
  set: (v: string) => { filters.role = v === ALL ? undefined : v }
})
const roleFilterItems = computed(() => [{ label: 'All roles', value: ALL }, ...roles.value.map(r => ({ label: r.name, value: r.key }))])

const total = computed(() => data.value?.total ?? 0)
const rangeText = computed(() => {
  if (!total.value) return 'No users'
  const from = (page.value - 1) * pageSize.value + 1
  const to = Math.min(total.value, page.value * pageSize.value)
  return `Showing ${formatNumber(from)}–${formatNumber(to)} of ${formatNumber(total.value)} users`
})

// ── add ──
const addOpen = ref(false)
const addState = reactive({ name: '', email: '', role: '', password: '' })
function openAdd() {
  Object.assign(addState, { name: '', email: '', role: roleItems.value.find(r => r.value !== SUPERADMIN_ROLE)?.value ?? '', password: '' })
  addOpen.value = true
}
const saving = ref(false)
async function submitAdd(e: FormSubmitEvent<z.output<typeof staffCreateSchema>>) {
  saving.value = true
  try {
    await $fetch('/api/admin/access/users', { method: 'POST', body: e.data })
    notify.success('User added', `Share the password with ${e.data.name} in person or through a secure channel.`)
    addOpen.value = false
    await refresh()
  } catch (err) {
    notify.error(err)
  } finally {
    saving.value = false
  }
}

// ── edit ──
const editSchema = z.object({
  name: z.string().trim().min(1, 'Required').max(200),
  role: z.string().min(1),
  active: z.boolean(),
  password: z.string().max(128).refine(v => !v || v.length >= 12, 'At least 12 characters')
})
const editTarget = ref<Row | null>(null)
const editState = reactive({ name: '', role: '', active: true, password: '' })
const isSelf = computed(() => editTarget.value?.id === me.value.user.id)
function openEdit(r: Row) {
  Object.assign(editState, { name: r.name, role: r.role, active: r.active, password: '' })
  editTarget.value = r
}
const editOpen = computed({ get: () => !!editTarget.value, set: (v) => { if (!v) editTarget.value = null } })
// your own role may be one you cannot hand out (e.g. superadmin): keep it in the list
const editRoleItems = computed(() => {
  const t = editTarget.value
  if (!t || roleItems.value.some(r => r.value === t.role)) return roleItems.value
  return [{ label: t.roleName, value: t.role, description: undefined }, ...roleItems.value]
})
async function submitEdit(e: FormSubmitEvent<z.output<typeof editSchema>>) {
  const t = editTarget.value!
  const body: Record<string, unknown> = {}
  if (e.data.name !== t.name) body.name = e.data.name
  if (e.data.role !== t.role) body.role = e.data.role
  if (e.data.active !== t.active) body.active = e.data.active
  if (e.data.password) body.password = e.data.password
  if (!Object.keys(body).length) {
    editTarget.value = null
    return
  }
  saving.value = true
  try {
    await $fetch(`/api/admin/access/users/${t.id}`, { method: 'PUT', body })
    notify.success('User saved', body.active === false ? 'They are signed out and can no longer sign in.' : body.password ? 'The new password works from now on.' : undefined)
    editTarget.value = null
    await refresh()
  } catch (err) {
    notify.error(err)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AdminPageHeader title="Users" description="Everyone who can sign in to the CMS. What they can do depends on their role.">
    <template #actions>
      <UButton to="/admin/access/roles" color="neutral" variant="outline" icon="i-lucide-shield-check" label="Manage roles" />
      <UButton icon="i-lucide-plus" label="Add user" @click="openAdd" />
    </template>
  </AdminPageHeader>

  <AdminPanel>
    <div class="flex flex-wrap items-center gap-4 p-2">
      <UInput v-model="q" icon="i-lucide-search" placeholder="Search name or email" aria-label="Search name or email" class="w-full sm:w-80 sm:min-w-[200px]" />
      <USelect v-model="roleFilter" :items="roleFilterItems" icon="i-lucide-list-filter" aria-label="Filter by role" class="ml-auto w-48" />
    </div>

    <UTable :data="tableSkeleton ? [] : data?.rows ?? []" :columns="columns" :loading="status === 'pending'" :ui="{ loading: 'p-0' }" empty="No users found." class="-mx-4 sm:-mx-5">
      <template #loading>
        <AdminSkeletonRows :rows="5" :columns="4" />
      </template>
      <template #name-cell="{ row }">
        <div class="flex items-center gap-3">
          <UAvatar :text="initials(row.original.name)" class="bg-brand-50 text-brand-900" />
          <div class="min-w-0">
            <div class="font-semibold text-highlighted">
              {{ row.original.name }}
              <span v-if="row.original.id === me.user.id" class="text-xs font-normal text-muted">(you)</span>
            </div>
            <div class="truncate text-xs text-muted">{{ row.original.email }}</div>
          </div>
        </div>
      </template>
      <template #role-cell="{ row }">
        <UBadge :color="row.original.role === SUPERADMIN_ROLE ? 'primary' : 'neutral'" variant="subtle" :label="row.original.roleName" />
      </template>
      <template #status-cell="{ row }">
        <UBadge v-if="row.original.active" color="success" variant="subtle" label="Active" />
        <UBadge v-else color="neutral" variant="subtle" icon="i-lucide-ban" label="Deactivated" />
      </template>
      <template #lastSeen-cell="{ row }">
        <span class="whitespace-nowrap">{{ row.original.lastSeenAt ? formatDateTime(row.original.lastSeenAt) : 'Never' }}</span>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <UButton v-if="manageable(row.original)" size="sm" color="neutral" variant="outline" icon="i-lucide-pencil" label="Edit" @click="openEdit(row.original)" />
          <UTooltip v-else text="Has permissions you do not have">
            <UIcon name="i-lucide-lock" class="size-4 text-dimmed" />
          </UTooltip>
        </div>
      </template>
    </UTable>

    <AdminListFooter v-model:page="page" v-model:page-size="pageSize" :total="total" :range-text="rangeText" />
  </AdminPanel>

  <UModal v-model:open="addOpen" title="Add user" description="They sign in at /login with this email and password." :ui="{ content: 'max-w-lg' }">
    <template #body>
      <UForm id="add-user-form" :schema="staffCreateSchema" :state="addState" class="flex flex-col gap-5" @submit="submitAdd">
        <UFormField label="Full name" name="name" required>
          <UInput v-model="addState.name" class="w-full" autofocus />
        </UFormField>
        <UFormField label="Email" name="email" required>
          <UInput v-model="addState.email" type="email" autocomplete="off" class="w-full" />
        </UFormField>
        <UFormField label="Role" name="role" required>
          <USelect v-model="addState.role" :items="roleItems" placeholder="Choose a role" class="w-full" />
        </UFormField>
        <UFormField label="Password" name="password" required help="At least 12 characters. Share it with them yourself.">
          <UInput v-model="addState.password" type="text" autocomplete="new-password" class="w-full font-mono" />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="outline" label="Cancel" @click="addOpen = false" />
        <UButton type="submit" form="add-user-form" label="Add user" :loading="saving" />
      </div>
    </template>
  </UModal>

  <UModal v-model:open="editOpen" :title="`Edit ${editTarget?.name ?? ''}`" :description="editTarget?.email" :ui="{ content: 'max-w-lg' }">
    <template #body>
      <UForm id="edit-user-form" :schema="editSchema" :state="editState" class="flex flex-col gap-5" @submit="submitEdit">
        <UFormField label="Full name" name="name" required>
          <UInput v-model="editState.name" class="w-full" />
        </UFormField>
        <UFormField label="Role" name="role" :help="isSelf ? 'You cannot change your own role.' : undefined">
          <USelect v-model="editState.role" :items="editRoleItems" :disabled="isSelf" class="w-full" />
        </UFormField>
        <UFormField name="active" :help="isSelf ? 'You cannot deactivate yourself.' : 'Deactivated users are signed out and cannot sign in.'">
          <USwitch v-model="editState.active" :disabled="isSelf" label="Active" />
        </UFormField>
        <UFormField label="New password" name="password" hint="Optional" help="Leave empty to keep the current password. Setting one signs them out everywhere.">
          <UInput v-model="editState.password" type="text" autocomplete="new-password" class="w-full font-mono" />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="outline" label="Cancel" @click="editTarget = null" />
        <UButton type="submit" form="edit-user-form" label="Save" :loading="saving" />
      </div>
    </template>
  </UModal>
</template>
