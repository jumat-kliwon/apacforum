<script setup lang="ts">
import { NAV, type NavEntry } from '~/data/site'

const route = useRoute()

/** Index of the desktop dropdown that is currently open, or -1 for none. */
const openIndex = ref(-1)
/** Mobile drawer, plus which accordion section inside it is expanded. */
const drawerOpen = ref(false)
const expanded = ref(-1)

const registerHref = '/apcr-2026#registration'

function isExternal(to?: string) {
  return !!to && /^https?:\/\//.test(to)
}

/**
 * A top-level entry is current when the route is its page or one of its children.
 * Entries that point at an anchor (`/#partners`) never count, or every one of them
 * would light up on the home page.
 */
function isCurrent(entry: NavEntry) {
  const to = entry.to
  if (!to || to.includes('#') || isExternal(to)) return false
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(`${to}/`)
}

useHead({ bodyAttrs: { class: () => (drawerOpen.value ? 'overflow-hidden' : '') } })

function closeAll() {
  openIndex.value = -1
  drawerOpen.value = false
}
watch(() => route.fullPath, closeAll)

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeAll()
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-ink/16 bg-paper/95 backdrop-blur-[12px]">
    <SiteContainer>
      <div class="flex h-[74px] items-center justify-between gap-6">
        <!-- The logo file carries wide transparent margins, so it is cropped by its frame. -->
        <NuxtLink to="/" class="relative block w-[132px] shrink-0 overflow-hidden lg:w-[155px]" style="aspect-ratio: 82 / 35" aria-label="APCR home">
          <img
            src="/landing/apcr-logo.webp"
            alt="APCR"
            width="500"
            height="500"
            class="absolute left-[-21.342%] top-1/2 w-[142.683%] max-w-none -translate-y-[50.855%]"
          >
        </NuxtLink>

        <!-- Desktop navigation -->
        <nav class="hidden items-center gap-[22px] xl:flex" aria-label="Main">
          <div
            v-for="(entry, i) in NAV"
            :key="entry.label"
            class="relative"
            @mouseenter="entry.items && (openIndex = i)"
            @mouseleave="openIndex === i && (openIndex = -1)"
          >
            <button
              v-if="entry.items"
              type="button"
              class="flex items-center gap-[5px] border-b-2 py-2 text-[12px]/[18px] font-bold text-ink transition-colors hover:text-navy"
              :class="isCurrent(entry) ? 'border-gold' : 'border-transparent'"
              :aria-expanded="openIndex === i"
              :aria-current="isCurrent(entry) ? 'page' : undefined"
              @click="openIndex = openIndex === i ? -1 : i"
            >
              {{ entry.label }}
              <UIcon name="i-lucide-chevron-down" class="size-[11px] text-ink/60" />
            </button>
            <a
              v-else-if="isExternal(entry.to)"
              :href="entry.to"
              target="_blank"
              rel="noopener"
              class="flex items-center border-b-2 border-transparent py-2 text-[12px]/[18px] font-bold text-ink transition-colors hover:text-navy"
            >
              {{ entry.label }}
            </a>
            <NuxtLink
              v-else-if="entry.to"
              :to="entry.to"
              class="flex items-center border-b-2 py-2 text-[12px]/[18px] font-bold text-ink transition-colors hover:text-navy"
              :class="isCurrent(entry) ? 'border-gold' : 'border-transparent'"
              :aria-current="isCurrent(entry) ? 'page' : undefined"
            >
              {{ entry.label }}
            </NuxtLink>

            <div
              v-if="entry.items && openIndex === i"
              class="absolute left-0 top-full w-[280px] border border-ink/16 bg-white shadow-[0_12px_32px_rgba(16,19,26,0.15)]"
            >
              <div class="h-0.5 bg-gold" />
              <ul class="py-2">
                <li v-for="item in entry.items" :key="item.label">
                  <NuxtLink
                    v-if="item.to && !isExternal(item.to)"
                    :to="item.to"
                    class="group flex items-center justify-between gap-3 border-l-2 border-transparent py-[11px] pl-5 pr-5 text-[13px] text-ink transition-colors hover:border-gold hover:bg-[#f7f4ec] hover:pl-[18px] hover:font-bold hover:text-navy"
                  >
                    {{ item.label }}
                    <UIcon name="i-lucide-arrow-right" class="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </NuxtLink>
                  <a
                    v-else-if="item.to"
                    :href="item.to"
                    target="_blank"
                    rel="noopener"
                    class="group flex items-center justify-between gap-3 border-l-2 border-transparent py-[11px] pl-5 pr-5 text-[13px] text-ink transition-colors hover:border-gold hover:bg-[#f7f4ec] hover:pl-[18px] hover:font-bold hover:text-navy"
                  >
                    {{ item.label }}
                    <UIcon name="i-lucide-arrow-up-right" class="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                  <!-- No page for this yet: shown, but not offered as a link. -->
                  <span v-else class="block py-[11px] pl-5 pr-5 text-[13px] text-ink/35" aria-disabled="true">
                    {{ item.label }}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <NuxtLink :to="registerHref" class="flex h-11 items-center rounded-[2px] bg-navy px-4 text-[12px]/[18px] font-bold text-white transition-colors hover:bg-navy-deep">
            Register
          </NuxtLink>
        </nav>

        <button
          type="button"
          class="-mr-2 flex size-11 items-center justify-center text-navy xl:hidden"
          :aria-expanded="drawerOpen"
          aria-controls="site-drawer"
          :aria-label="drawerOpen ? 'Close navigation' : 'Open navigation'"
          @click="drawerOpen = !drawerOpen"
        >
          <UIcon :name="drawerOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="size-6" />
        </button>
      </div>
    </SiteContainer>

    <!-- Mobile drawer -->
    <div v-if="drawerOpen" id="site-drawer" class="max-h-[calc(100dvh-74px)] overflow-y-auto border-t border-ink/16 bg-paper xl:hidden">
      <SiteContainer>
        <nav class="py-4" aria-label="Main">
          <div v-for="(entry, i) in NAV" :key="entry.label" class="border-b border-ink/10 last:border-0">
            <div class="flex items-center justify-between">
              <NuxtLink v-if="entry.to && !isExternal(entry.to)" :to="entry.to" class="flex-1 py-3.5 text-sm font-bold text-ink">
                {{ entry.label }}
              </NuxtLink>
              <a v-else-if="entry.to" :href="entry.to" target="_blank" rel="noopener" class="flex-1 py-3.5 text-sm font-bold text-ink">
                {{ entry.label }}
              </a>
              <span v-else class="flex-1 py-3.5 text-sm font-bold text-ink">{{ entry.label }}</span>

              <button
                v-if="entry.items"
                type="button"
                class="flex size-11 items-center justify-center text-ink/60"
                :aria-expanded="expanded === i"
                :aria-label="`${expanded === i ? 'Collapse' : 'Expand'} ${entry.label}`"
                @click="expanded = expanded === i ? -1 : i"
              >
                <UIcon name="i-lucide-chevron-down" class="size-4 transition-transform" :class="expanded === i && 'rotate-180'" />
              </button>
            </div>

            <ul v-if="entry.items && expanded === i" class="pb-3 pl-4">
              <li v-for="item in entry.items" :key="item.label">
                <NuxtLink v-if="item.to && !isExternal(item.to)" :to="item.to" class="block py-2.5 text-[13px] text-prose">
                  {{ item.label }}
                </NuxtLink>
                <a v-else-if="item.to" :href="item.to" target="_blank" rel="noopener" class="block py-2.5 text-[13px] text-prose">
                  {{ item.label }}
                </a>
                <span v-else class="block py-2.5 text-[13px] text-ink/35" aria-disabled="true">{{ item.label }}</span>
              </li>
            </ul>
          </div>

          <NuxtLink :to="registerHref" class="mt-5 flex h-11 items-center justify-center rounded-[2px] bg-navy px-4 text-[12px] font-bold text-white">
            Register
          </NuxtLink>
        </nav>
      </SiteContainer>
    </div>
  </header>
</template>
