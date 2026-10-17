<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { roleFormSchema, type RoleForm } from '~~/shared/schemas/access'

/** Role editor: name, description and a checkbox per permission, grouped. Used by "Add role" and "Edit role". */
const props = defineProps<{ initial?: RoleForm, saving?: boolean, submitLabel: string }>()
const emit = defineEmits<{ submit: [RoleForm] }>()

const { access, can } = useAdminAccess()
const state = reactive<RoleForm>(props.initial ? structuredClone(toRaw(props.initial)) : { name: '', description: '', permissions: [] })

const groups = computed(() => {
  const out: Record<string, { key: Permission, label: string, description: string }[]> = {}
  for (const key of PERMISSION_KEYS) {
    const p = PERMISSIONS[key]
    ;(out[p.group] ??= []).push({ key, label: p.label, description: p.description })
  }
  return Object.entries(out)
})

// no escalation: only permissions you hold yourself can be granted
const grantable = (key: Permission) => access.value?.role.key === SUPERADMIN_ROLE || can(key)

function toggle(key: Permission, on: boolean | 'indeterminate') {
  const set = new Set(state.permissions)
  if (on === true) set.add(key)
  else set.delete(key)
  state.permissions = PERMISSION_KEYS.filter(k => set.has(k))
}

const onSubmit = (e: FormSubmitEvent<RoleForm>) => emit('submit', e.data)
</script>

<template>
  <UForm :schema="roleFormSchema" :state="state" class="flex flex-col gap-6" @submit="onSubmit">
    <AdminPanel title="Role">
      <div class="grid gap-5 sm:grid-cols-2">
        <UFormField label="Name" name="name" required>
          <UInput v-model="state.name" placeholder="For example: Finance" class="w-full" />
        </UFormField>
        <UFormField label="Description" name="description" hint="Optional">
          <UInput v-model="state.description!" placeholder="What people with this role do" class="w-full" />
        </UFormField>
      </div>
    </AdminPanel>

    <AdminPanel title="Permissions" :description="`${state.permissions.length} of ${PERMISSION_KEYS.length} selected. Menus and pages follow these permissions.`">
      <UFormField name="permissions">
        <div class="flex flex-col gap-5">
          <fieldset v-for="[group, items] in groups" :key="group" class="flex flex-col gap-2">
            <legend class="pb-2 text-[11px]/4 font-medium uppercase tracking-[1.1px] text-muted">
              {{ group }}
            </legend>
            <div class="grid gap-2 sm:grid-cols-2">
              <label
                v-for="p in items"
                :key="p.key"
                class="flex gap-3 rounded-md border border-default p-3"
                :class="grantable(p.key) ? 'cursor-pointer hover:bg-elevated/50' : 'cursor-not-allowed opacity-60'"
              >
                <UCheckbox
                  :model-value="state.permissions.includes(p.key)"
                  :disabled="!grantable(p.key)"
                  :aria-label="p.label"
                  @update:model-value="v => toggle(p.key, v)"
                />
                <span class="flex min-w-0 flex-col">
                  <span class="text-sm font-medium text-highlighted">{{ p.label }}</span>
                  <span class="text-[13px]/[18px] text-muted">{{ p.description }}</span>
                  <span v-if="!grantable(p.key)" class="text-xs text-muted">You do not have this permission yourself</span>
                </span>
              </label>
            </div>
          </fieldset>
        </div>
      </UFormField>
    </AdminPanel>

    <div class="flex justify-end gap-2">
      <UButton to="/admin/access/roles" color="neutral" variant="outline" label="Cancel" />
      <UButton type="submit" :label="submitLabel" :loading="saving" />
    </div>
  </UForm>
</template>
