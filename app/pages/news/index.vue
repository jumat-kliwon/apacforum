<script setup lang="ts">
import { WHATSAPP_URL } from '~/data/site'

definePageMeta({ layout: 'site' })

const route = useRoute()
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const pageSize = 7

const { data } = await useFetch('/api/public/articles', {
  query: computed(() => ({ page: page.value, pageSize })),
  // An empty CMS renders the empty state below, never stand-in stories.
  default: () => ({ rows: [], total: 0 })
})

const config = useRuntimeConfig()
const siteUrl = String(config.public.siteUrl || '').replace(/\/$/, '')
useSeoMeta({
  title: 'News & Media',
  description: 'News and updates about APCR 2026, the ASEAN Public Communication & Reputation Forum — 2–4 December 2026, Medan, North Sumatra, Indonesia.',
  ogTitle: 'News & Media · APCR',
  ogType: 'website',
  themeColor: '#031735'
})
useHead({ link: [{ rel: 'canonical', href: `${siteUrl}/news${page.value > 1 ? `?page=${page.value}` : ''}` }] })

interface Story { image?: string, alt: string, date: string, title: string, copy: string, to: string }

/** Published CMS articles are the only source for the feed. */
const stories = computed<Story[]>(() => (data.value?.rows ?? []).map(a => ({
  image: a.thumbnailUrl || undefined,
  alt: a.title,
  date: a.publishedAt ? formatDate(a.publishedAt) : '',
  title: a.title,
  copy: a.excerpt || '',
  to: `/news/${a.slug}`
})))
const featured = computed(() => stories.value[0])
const rest = computed(() => stories.value.slice(1))

const totalPages = computed(() => Math.max(1, Math.ceil((data.value?.total ?? 0) / pageSize)))
const pages = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1))
</script>

<template>
  <div>
    <SiteHero
      eyebrow="NEWS &amp; MEDIA"
      title="APCR NEWSROOM."
      blurb="News and updates about APCR 2026 — the ASEAN Public Communication & Reputation Forum, 2–4 December 2026 in Medan, North Sumatra, Indonesia."
      title-class="text-[clamp(38px,5.9vw,70px)] leading-none tracking-[-0.047em]"
    >
      <template #actions>
        <SiteButton :to="WHATSAPP_URL" icon="i-lucide-arrow-up-right">
          Media enquiries
        </SiteButton>
      </template>
    </SiteHero>

    <!-- Latest news -->
    <section id="latest" class="py-20 lg:pb-[84px] lg:pt-20">
      <SiteContainer>
        <div class="flex flex-col gap-[30px]">
          <SiteSectionHead eyebrow="LATEST NEWS" title="NEWS AND UPDATES ON APCR 2026." size="md" />

          <SiteNotice v-if="!featured" title="No news published yet.">
            News and updates about APCR 2026 will be published here. For media enquiries,
            <a :href="WHATSAPP_URL" target="_blank" rel="noopener" class="font-bold text-navy hover:underline">contact APCR via WhatsApp</a>.
          </SiteNotice>

          <template v-else>
            <NuxtLink
              :to="featured.to"
              class="group flex flex-col overflow-hidden rounded-[2px] border border-ink/16 bg-white lg:flex-row"
            >
              <img v-if="featured.image" :src="featured.image" :alt="featured.alt" width="544" height="392" class="h-[240px] w-full object-cover lg:h-auto lg:w-[544px] lg:shrink-0">
              <div v-else class="h-[240px] w-full bg-paper lg:h-auto lg:min-h-[320px] lg:w-[544px] lg:shrink-0" aria-hidden="true" />
              <div class="flex flex-1 flex-col justify-center gap-4 p-8 lg:p-11">
                <div class="flex items-center gap-2.5">
                  <span v-if="featured.date" class="text-[12px] text-prose">{{ featured.date }}</span>
                  <span v-if="featured.date" class="size-[3px] rounded-full bg-ink/25" />
                  <span class="text-[11px] font-extrabold tracking-[0.1em] text-navy">NEWS</span>
                </div>
                <h3 class="text-[clamp(24px,2.9vw,34px)] font-extrabold leading-[1.12] tracking-[-0.032em] text-ink group-hover:underline">
                  {{ featured.title }}
                </h3>
                <p v-if="featured.copy" class="text-[16px] leading-[1.7] text-prose">
                  {{ featured.copy }}
                </p>
                <p class="flex items-center gap-2 pt-1.5 text-[13px] font-bold text-navy">
                  Read article
                  <UIcon name="i-lucide-arrow-right" class="size-[15px]" />
                </p>
              </div>
            </NuxtLink>

            <ul v-if="rest.length" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <li v-for="s in rest" :key="s.to">
                <NuxtLink
                  :to="s.to"
                  class="group flex h-full flex-col overflow-hidden rounded-[2px] border border-ink/16 bg-white"
                >
                  <img v-if="s.image" :src="s.image" :alt="s.alt" width="347" height="188" loading="lazy" class="h-[188px] w-full object-cover">
                  <div v-else class="h-[188px] w-full bg-paper" aria-hidden="true" />
                  <div class="flex flex-1 flex-col gap-[11px] px-6 pb-6 pt-[22px]">
                    <div class="flex items-center gap-2.5">
                      <span v-if="s.date" class="text-[12px] text-prose">{{ s.date }}</span>
                      <span v-if="s.date" class="size-[3px] rounded-full bg-ink/25" />
                      <span class="text-[11px] font-extrabold tracking-[0.1em] text-navy">NEWS</span>
                    </div>
                    <h3 class="text-[19px] font-extrabold leading-[1.24] tracking-[-0.021em] text-ink group-hover:underline">
                      {{ s.title }}
                    </h3>
                    <p v-if="s.copy" class="text-[14px] leading-[1.62] text-prose">
                      {{ s.copy }}
                    </p>
                  </div>
                </NuxtLink>
              </li>
            </ul>
          </template>

          <nav v-if="totalPages > 1" class="flex items-center justify-center gap-2 pt-3.5" aria-label="Pagination">
            <NuxtLink
              v-for="p in pages"
              :key="p"
              :to="{ query: { page: p > 1 ? p : undefined } }"
              class="flex size-[38px] items-center justify-center rounded-[2px] text-[13px] font-bold"
              :class="p === page ? 'bg-navy text-white' : 'border border-ink/16 text-ink hover:border-ink/35'"
              :aria-current="p === page ? 'page' : undefined"
            >
              {{ p }}
            </NuxtLink>
          </nav>
        </div>
      </SiteContainer>
    </section>
  </div>
</template>
