<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const session = useAdminSession()
const route = useRoute()

const { load } = useAdminEvents()
const { event: current } = useCurrentEvent()
load()

// links follow the event in the URL, or the last one opened when on a global page
const eventItems = computed<NavigationMenuItem[]>(() => {
  const id = current.value?.id
  if (!id) return []
  return [
    { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: eventPath(id), exact: true },
    { label: 'Registrations', icon: 'i-lucide-users', to: eventPath(id, 'registrations') },
    { label: 'Transactions', icon: 'i-lucide-credit-card', to: '/admin/transactions' }
  ]
})
const workspaceItems: NavigationMenuItem[] = [
  { label: 'Events', icon: 'i-lucide-calendar-days', to: '/admin/events' },
  { label: 'Email templates', icon: 'i-lucide-mail', to: '/admin/email-templates' }
]

const name = computed(() => session.value.data?.user.name ?? '')

const sessionCheckedAt = useAdminSessionCheckedAt()
async function signOut() {
  await authClient.signOut()
  sessionCheckedAt.value = 0
  await navigateTo('/login')
}

// close the mobile drawer on navigation
const open = ref(false)
watch(() => route.fullPath, () => { open.value = false })
</script>

<template>
  <UDashboardGroup unit="px">
    <UDashboardSidebar
      v-model:open="open"
      :default-size="240"
      :min-size="240"
      :max-size="240"
      :ui="{
        root: 'bg-default',
        header: 'h-16 px-4 sm:px-4 border-b border-default',
        body: 'p-2 sm:px-2 gap-0',
        footer: 'p-2 sm:px-2 border-t border-default'
      }"
    >
      <template #header>
        <NuxtLink to="/admin" class="flex items-center gap-3">
          <span class="flex size-8 shrink-0 items-center justify-center rounded-sm bg-brand-400 text-[15px] font-extrabold text-(--brand-ink)">A</span>
          <span class="flex min-w-0 flex-col leading-tight">
            <span class="text-[15px] font-bold text-highlighted">APCR CMS</span>
            <span class="text-xs text-muted">Admin panel</span>
          </span>
        </NuxtLink>
      </template>

      <div class="px-1 pt-3">
        <AdminEventSwitcher />
      </div>

      <!-- Core Menu Tree: section label 16/12/4, items 40px tall with 8/12 padding, 2px apart -->
      <template v-if="eventItems.length">
        <p class="px-3 pt-4 pb-1 text-[11px]/4 font-medium uppercase tracking-[1.1px] text-muted">
          Event
        </p>
        <UNavigationMenu
          :items="eventItems"
          orientation="vertical"
          :ui="{
            list: 'flex flex-col gap-0.5',
            link: 'min-h-10 px-3 py-2 gap-3 text-sm/5 before:inset-0 before:rounded-sm'
          }"
        />
      </template>
      <p class="px-3 pt-4 pb-1 text-[11px]/4 font-medium uppercase tracking-[1.1px] text-muted">
        Workspace
      </p>
      <UNavigationMenu
        :items="workspaceItems"
        orientation="vertical"
        :ui="{
          list: 'flex flex-col gap-0.5',
          link: 'min-h-10 px-3 py-2 gap-3 text-sm/5 before:inset-0 before:rounded-sm'
        }"
      />

      <template #footer>
        <div class="flex h-11 w-full items-center gap-2.5 px-2">
          <UAvatar :text="initials(name || 'A')" size="md" class="bg-brand-100 text-brand-900" />
          <div class="flex min-w-0 grow flex-col">
            <span class="truncate text-sm font-semibold text-highlighted">{{ name }}</span>
            <span class="text-xs text-muted">Admin</span>
          </div>
          <UButton icon="i-lucide-log-out" color="neutral" variant="ghost" aria-label="Sign out" @click="signOut" />
        </div>
      </template>
    </UDashboardSidebar>

    <UDashboardPanel :ui="{ body: 'bg-muted px-4 pt-6 pb-10 sm:px-8 sm:pt-7 gap-6' }">
      <template #header>
        <UDashboardNavbar class="lg:hidden" title="APCR CMS">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
        </UDashboardNavbar>
      </template>
      <template #body>
        <div class="mx-auto flex w-full max-w-[1440px] grow flex-col gap-6">
          <slot />
        </div>
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
