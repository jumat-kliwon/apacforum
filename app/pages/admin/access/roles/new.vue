<script setup lang="ts">
import type { RoleForm } from '~~/shared/schemas/access'

definePageMeta({ layout: 'focus', middleware: 'admin', permission: 'access.manage', backTo: '/admin/access/roles' })

const notify = useNotify()
const saving = ref(false)

async function create(form: RoleForm) {
  saving.value = true
  try {
    await $fetch('/api/admin/access/roles', { method: 'POST', body: form })
    notify.success('Role created', 'Assign it to people under Access → Users.')
    await navigateTo('/admin/access/roles')
  } catch (err) {
    notify.error(err, 'Could not save the role')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AdminPageHeader title="Add role" description="A role is a set of permissions. Everyone with the role gets them." />
  <AdminRoleForm submit-label="Create role" :saving="saving" @submit="create" />
</template>
