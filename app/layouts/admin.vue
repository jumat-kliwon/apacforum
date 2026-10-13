<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const session = useAdminSession()
const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
  { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/admin', exact: true },
  { label: 'Pendaftaran', icon: 'i-lucide-users', to: '/admin/peserta' },
  { label: 'Transaksi', icon: 'i-lucide-credit-card', to: '/admin/transaksi' },
  { label: 'Event', icon: 'i-lucide-calendar-days', to: '/admin/event' },
  { label: 'Template email', icon: 'i-lucide-mail', to: '/admin/template-email' }
])

const name = computed(() => session.value.data?.user.name ?? '')

async function logout() {
  await authClient.signOut()
  await navigateTo('/login')
}

// tutup sidebar mobile saat pindah halaman
const open = ref(false)
watch(() => route.fullPath, () => { open.value = false })
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      v-model:open="open"
      :default-size="15"
      :ui="{ root: 'bg-default', header: 'h-16 border-b border-default', footer: 'border-t border-default' }"
    >
      <template #header>
        <NuxtLink to="/admin" class="flex items-center gap-3">
          <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-400 text-[15px] font-extrabold text-(--brand-ink)">A</span>
          <span class="flex min-w-0 flex-col leading-tight">
            <span class="text-[15px] font-bold text-highlighted">APCR CMS</span>
            <span class="text-xs text-muted">Admin panel</span>
          </span>
        </NuxtLink>
      </template>

      <p class="px-2.5 pb-1 text-xs font-medium uppercase tracking-wide text-dimmed">
        Menu
      </p>
      <UNavigationMenu :items="items" orientation="vertical" :ui="{ link: 'py-2' }" />

      <template #footer>
        <div class="flex w-full items-center gap-3">
          <UAvatar :text="initials(name || 'A')" size="sm" class="bg-brand-100 text-brand-900" />
          <div class="flex min-w-0 grow flex-col">
            <span class="truncate text-sm font-semibold text-highlighted">{{ name }}</span>
            <span class="text-xs text-muted">Admin</span>
          </div>
          <UButton icon="i-lucide-log-out" color="neutral" variant="ghost" aria-label="Keluar" @click="logout" />
        </div>
      </template>
    </UDashboardSidebar>

    <UDashboardPanel :ui="{ body: 'bg-muted p-4 sm:p-8 gap-6' }">
      <template #header>
        <UDashboardNavbar class="lg:hidden" title="APCR CMS">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
        </UDashboardNavbar>
      </template>
      <template #body>
        <slot />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
