<script setup lang="ts">
import type { RoleForm } from '~~/shared/schemas/access'

definePageMeta({ layout: 'focus', middleware: 'admin', permission: 'access.manage', backTo: '/admin/access/roles' })

const route = useRoute()
const notify = useNotify()
const id = String(route.params.id)
// roles are few: the list has everything the form needs
const { data } = await useFetch('/api/admin/access/roles')
const role = computed(() => data.value?.roles.find(r => r.id === id))
const initial = computed<RoleForm | undefined>(() => role.value && {
  name: role.value.name,
  description: role.value.description ?? '',
  permissions: role.value.permissions
})

const saving = ref(false)
async function update(form: RoleForm) {
  saving.value = true
  try {
    await $fetch(`/api/admin/access/roles/${id}`, { method: 'PUT', body: form })
    notify.success('Role saved', 'The change applies to everyone with this role right away.')
    await navigateTo('/admin/access/roles')
  } catch (err) {
    notify.error(err, 'Could not save the role')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="!role || role.isSystem" class="rounded-md border border-default bg-default p-10">
    <UEmpty icon="i-lucide-shield-x" :title="role ? 'System roles cannot be changed' : 'Role not found'" :actions="[{ label: 'Back to roles', to: '/admin/access/roles' }]" />
  </div>
  <template v-else>
    <AdminPageHeader :title="`Edit ${role.name}`" :description="`${formatNumber(role.users)} ${role.users === 1 ? 'person has' : 'people have'} this role. Changes apply to them right away.`" />
    <AdminRoleForm :initial="initial" submit-label="Save role" :saving="saving" @submit="update" />
  </template>
</template>
