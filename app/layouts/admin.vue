<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const session = useAdminSession()
// menus only show what the role may open; the middleware and the API enforce it
const { access, can } = useAdminAccess()
const route = useRoute()
const router = useRouter()
// where the admin is going: the menu and breadcrumb follow a click at once, before the page has loaded
const nextPath = ref(route.path)
watch(() => route.path, (p) => { nextPath.value = p })

const { events, load } = useAdminEvents()
const { event: current } = useCurrentEvent()
load()

// a section stays highlighted on its add, edit and detail pages too
const section = (label: string, icon: string, to: string): NavigationMenuItem => ({
  label, icon, to, active: nextPath.value === to || nextPath.value.startsWith(`${to}/`)
})

// links follow the event in the URL, or the last one opened when on a global page
const eventItems = computed<NavigationMenuItem[]>(() => {
  const id = current.value?.id
  if (!id) return []
  return [
    can(SECTION_PERMISSION['']) && { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: eventPath(id), exact: true },
    can(SECTION_PERMISSION.registrations) && section('Registrations', 'i-lucide-users', eventPath(id, 'registrations')),
    can(SECTION_PERMISSION.transactions) && section('Transactions', 'i-lucide-credit-card', eventPath(id, 'transactions')),
    can(SECTION_PERMISSION.tickets) && section('Tickets', 'i-lucide-ticket', eventPath(id, 'tickets')),
    can(SECTION_PERMISSION.speakers) && section('Speakers', 'i-lucide-mic', eventPath(id, 'speakers')),
    can(SECTION_PERMISSION.partners) && section('Partners', 'i-lucide-handshake', eventPath(id, 'partners')),
    can(SECTION_PERMISSION.guestbook) && section('Guestbook', 'i-lucide-book-open-text', eventPath(id, 'guestbook')),
    can(SECTION_PERMISSION.settings) && section('Event settings', 'i-lucide-settings', eventPath(id, 'settings'))
  ].filter(item => !!item)
})
// breadcrumb after the event switcher, e.g. "Tickets" on /admin/e/:id/tickets/new
const SECTION_LABELS: Record<string, string> = {
  '': 'Dashboard', registrations: 'Registrations', transactions: 'Transactions', tickets: 'Tickets', speakers: 'Speakers', partners: 'Partners', guestbook: 'Guestbook', settings: 'Event settings'
}
const sectionLabel = computed(() => {
  const m = /^\/admin\/e\/[^/]+\/?([^/]*)/.exec(nextPath.value)
  return m ? SECTION_LABELS[m[1] ?? ''] : undefined
})

const workspaceItems = computed<NavigationMenuItem[]>(() => [
  can('news.manage') && { label: 'News & Media', icon: 'i-lucide-newspaper', to: '/admin/news' },
  can('email_templates.view') && { label: 'Email templates', icon: 'i-lucide-mail', to: '/admin/email-templates' },
  can('settings.manage') && { label: 'Currency rates', icon: 'i-lucide-banknote', to: '/admin/settings/currency' }
].filter(item => !!item))

const accessItems = computed<NavigationMenuItem[]>(() => can('access.manage')
  ? [section('Users', 'i-lucide-user-cog', '/admin/access/users'), section('Roles', 'i-lucide-shield-check', '/admin/access/roles')]
  : [])

const name = computed(() => session.value.data?.user.name ?? '')

const sessionCheckedAt = useAdminSessionCheckedAt()
async function signOut() {
  await authClient.signOut()
  sessionCheckedAt.value = 0
  access.value = null
  await navigateTo('/login')
}

// Pages wait for their data before they render, so show a skeleton shaped like the page that is
// opening. The short delay keeps fast navigations from flashing it.
const nuxtApp = useNuxtApp()
const pageLoading = ref(false)
let skeletonTimer: ReturnType<typeof setTimeout> | undefined
const offBeforeEach = router.beforeEach((to) => { nextPath.value = to.path })
// a cancelled or failed navigation stays on the current page
const offAfterEach = router.afterEach((_to, _from, failure) => { if (failure) nextPath.value = route.path })
const offPageStart = nuxtApp.hook('page:start', () => {
  clearTimeout(skeletonTimer)
  skeletonTimer = setTimeout(() => { pageLoading.value = true }, 120)
})
const offPageFinish = nuxtApp.hook('page:finish', () => {
  clearTimeout(skeletonTimer)
  pageLoading.value = false
})
onBeforeUnmount(() => {
  offBeforeEach()
  offAfterEach()
  offPageStart()
  offPageFinish()
  clearTimeout(skeletonTimer)
})
const skeleton = computed(() => pageSkeleton(nextPath.value))

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

      <!-- Core Menu Tree: section label 16/12/4, items 40px tall with 8/12 padding, 2px apart -->
      <template v-if="eventItems.length">
        <p class="px-3 pt-3 pb-1 text-[11px]/4 font-medium uppercase tracking-[1.1px] text-muted">
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
      <template v-if="workspaceItems.length">
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
      </template>
      <template v-if="accessItems.length">
        <p class="px-3 pt-4 pb-1 text-[11px]/4 font-medium uppercase tracking-[1.1px] text-muted">
          Access
        </p>
        <UNavigationMenu
          :items="accessItems"
          orientation="vertical"
          :ui="{
            list: 'flex flex-col gap-0.5',
            link: 'min-h-10 px-3 py-2 gap-3 text-sm/5 before:inset-0 before:rounded-sm'
          }"
        />
      </template>

      <template #footer>
        <div class="flex h-11 w-full items-center gap-2.5 px-2">
          <UAvatar :text="initials(name || 'A')" size="md" class="bg-brand-100 text-brand-900" />
          <div class="flex min-w-0 grow flex-col">
            <span class="truncate text-sm font-semibold text-highlighted">{{ name }}</span>
            <span class="text-xs text-muted">{{ access?.role.name }}</span>
          </div>
          <UButton icon="i-lucide-log-out" color="neutral" variant="ghost" aria-label="Sign out" @click="signOut" />
        </div>
      </template>
    </UDashboardSidebar>

    <UDashboardPanel :ui="{ body: 'bg-muted px-4 pt-6 pb-10 sm:px-8 sm:pt-7 gap-6' }">
      <template #header>
        <UDashboardNavbar :ui="{ root: 'h-16 bg-default sm:px-8', title: 'min-w-0 gap-2 font-normal' }">
          <template #title>
            <!-- no events yet: nothing to switch between -->
            <UButton v-if="events && !events.length && can('events.manage')" to="/admin/events/new" icon="i-lucide-plus" label="Create the first event" />
            <template v-else>
              <AdminEventSwitcher />
              <template v-if="sectionLabel">
                <UIcon name="i-lucide-chevron-right" class="hidden size-4 shrink-0 text-dimmed sm:block" aria-hidden="true" />
                <span class="hidden truncate text-sm font-medium text-toned sm:inline">{{ sectionLabel }}</span>
              </template>
            </template>
          </template>
          <template #right>
            <UTooltip text="Switch event">
              <span class="hidden items-center gap-1 lg:flex">
                <UKbd value="meta" /><UKbd value="K" />
              </span>
            </UTooltip>
          </template>
        </UDashboardNavbar>
      </template>
      <template #body>
        <div class="mx-auto flex w-full max-w-[1440px] grow flex-col gap-6">
          <AdminSkeletonPage v-if="pageLoading" :variant="skeleton" />
          <div v-show="!pageLoading" class="contents">
            <slot />
          </div>
        </div>
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
