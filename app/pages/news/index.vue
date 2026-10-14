<script setup lang="ts">
import { ARTICLES, COVERAGE, FEATURED, GALLERY, MEDIA_KIT, PARTNER_STORIES, PRESS_RELEASES, SPEAKER_PIECES } from '~/data/news'

definePageMeta({ layout: 'site' })

const route = useRoute()
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const pageSize = 7

const { data } = await useFetch('/api/public/articles', {
  query: computed(() => ({ page: page.value, pageSize })),
  // The newsroom still renders from the design content when the CMS is empty.
  default: () => ({ rows: [], total: 0 })
})

const config = useRuntimeConfig()
const siteUrl = String(config.public.siteUrl || '').replace(/\/$/, '')
useSeoMeta({
  title: 'News & Media',
  description: 'The public voice of APCR: news, analysis, press releases and media coverage from the ASEAN Public Communication & Reputation Forum.',
  ogTitle: 'News & Media · APCR',
  ogType: 'website',
  themeColor: '#031735'
})
useHead({ link: [{ rel: 'canonical', href: `${siteUrl}/news${page.value > 1 ? `?page=${page.value}` : ''}` }] })

interface Story { image: string, alt: string, date: string, kind: string, title: string, copy: string, to?: string }

/** Published articles take over the feed; the design copy stands in until then. */
const published = computed<Story[]>(() => (data.value?.rows ?? []).map(a => ({
  image: a.thumbnailUrl || '/landing/news-featured.jpg',
  alt: a.title,
  date: a.publishedAt ? formatDate(a.publishedAt) : '',
  kind: 'NEWS',
  title: a.title,
  copy: a.excerpt || '',
  to: `/news/${a.slug}`
})))
const usingCms = computed(() => published.value.length > 0)
const featured = computed<Story>(() => (usingCms.value ? published.value[0]! : { ...FEATURED }))
const stories = computed<Story[]>(() => (usingCms.value ? published.value.slice(1) : ARTICLES))

const totalPages = computed(() => Math.max(1, Math.ceil((data.value?.total ?? 0) / pageSize)))
const pages = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1))
</script>

<template>
  <div>
    <SiteHero
      eyebrow="NEWS &amp; MEDIA"
      title="APCR NEWSROOM."
      blurb="The public voice of APCR. Not only what happens at the forum — the ideas, evidence and perspectives that keep the regional trust agenda in circulation all year."
      title-class="text-[clamp(38px,5.9vw,70px)] leading-none tracking-[-0.047em]"
    >
      <template #actions>
        <SiteButton to="#media-kit" icon="i-lucide-arrow-down">
          Download the media kit
        </SiteButton>
        <SiteButton to="mailto:media@apcrforum.org" variant="light" icon="i-lucide-mail">
          Media enquiries
        </SiteButton>
      </template>
    </SiteHero>

    <!-- Latest news -->
    <section class="py-20 lg:pb-11 lg:pt-20">
      <SiteContainer>
        <div class="flex flex-col gap-[30px]">
          <SiteSectionHead eyebrow="LATEST NEWS" title="IDEAS AND ANNOUNCEMENTS, IN ONE FEED." size="md">
            <template #intro>
              Analysis and perspective sit alongside forum announcements — each piece tagged so you can tell which is which.
            </template>
          </SiteSectionHead>

          <component
            :is="featured.to ? 'NuxtLink' : 'div'"
            :to="featured.to"
            class="group flex flex-col overflow-hidden rounded-[2px] border border-ink/16 bg-white lg:flex-row"
          >
            <img :src="featured.image" :alt="featured.alt" width="544" height="392" class="h-[240px] w-full object-cover lg:h-auto lg:w-[544px] lg:shrink-0">
            <div class="flex flex-1 flex-col justify-center gap-4 p-8 lg:p-11">
              <div class="flex items-center gap-2.5">
                <span class="text-[12px] text-prose">{{ featured.date }}</span>
                <span class="size-[3px] rounded-full bg-ink/25" />
                <span class="text-[11px] font-extrabold tracking-[0.1em] text-navy">{{ featured.kind }}</span>
              </div>
              <h3 class="text-[clamp(24px,2.9vw,34px)] font-extrabold leading-[1.12] tracking-[-0.032em] text-ink group-hover:underline">
                {{ featured.title }}
              </h3>
              <p class="text-[16px] leading-[1.7] text-prose">
                {{ featured.copy }}
              </p>
              <p class="flex items-center gap-2 pt-1.5 text-[13px] font-bold" :class="featured.to ? 'text-navy' : 'text-ink/35'">
                Read article
                <UIcon name="i-lucide-arrow-right" class="size-[15px]" />
              </p>
            </div>
          </component>

          <ul class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <li v-for="s in stories" :key="s.title">
              <component
                :is="s.to ? 'NuxtLink' : 'div'"
                :to="s.to"
                class="group flex h-full flex-col overflow-hidden rounded-[2px] border border-ink/16 bg-white"
              >
                <img :src="s.image" :alt="s.alt" width="347" height="188" loading="lazy" class="h-[188px] w-full object-cover">
                <div class="flex flex-1 flex-col gap-[11px] px-6 pb-6 pt-[22px]">
                  <div class="flex items-center gap-2.5">
                    <span class="text-[12px] text-prose">{{ s.date }}</span>
                    <span class="size-[3px] rounded-full bg-ink/25" />
                    <span class="text-[11px] font-extrabold tracking-[0.1em] text-navy">{{ s.kind }}</span>
                  </div>
                  <h3 class="text-[19px] font-extrabold leading-[1.24] tracking-[-0.021em] text-ink group-hover:underline">
                    {{ s.title }}
                  </h3>
                  <p class="text-[14px] leading-[1.62] text-prose">
                    {{ s.copy }}
                  </p>
                </div>
              </component>
            </li>
          </ul>

          <nav v-if="usingCms && totalPages > 1" class="flex items-center justify-center gap-2 pt-3.5" aria-label="Pagination">
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

    <!-- Press releases -->
    <section id="press-releases" class="border-t border-ink/16 bg-white py-20 lg:pb-20 lg:pt-[76px]">
      <SiteContainer>
        <div class="flex flex-col gap-7">
          <SiteSectionHead eyebrow="PRESS RELEASES" title="OFFICIAL STATEMENTS." size="md">
            <template #action>
              <!-- A full press release archive is still to come. -->
              <p class="flex items-center gap-2 text-[13px] font-bold text-ink/35">
                All press releases
                <UIcon name="i-lucide-arrow-right" class="size-3.5" />
              </p>
            </template>
          </SiteSectionHead>

          <ul class="border-t border-ink/16">
            <li v-for="r in PRESS_RELEASES" :key="r.title" class="flex flex-col gap-3 border-b border-ink/16 py-5 lg:flex-row lg:items-center lg:gap-6">
              <span class="text-[13px] text-prose lg:w-[150px] lg:shrink-0">{{ r.date }}</span>
              <h3 class="flex-1 text-[18px] font-extrabold leading-[1.35] tracking-[-0.022em] text-ink">
                {{ r.title }}
              </h3>
              <span class="text-[12px] text-prose-dim lg:w-20 lg:shrink-0">{{ r.languages }}</span>
              <span class="inline-flex shrink-0 items-center gap-1.5 self-start rounded-[2px] border border-ink/16 px-2.5 py-1.5 text-[11px] font-extrabold tracking-[0.055em] text-navy">
                PDF
                <UIcon name="i-lucide-arrow-down" class="size-3" />
              </span>
            </li>
          </ul>
        </div>
      </SiteContainer>
    </section>

    <!-- Media coverage -->
    <section id="coverage" class="py-20 lg:pb-20 lg:pt-[76px]">
      <SiteContainer>
        <div class="flex flex-col gap-7">
          <SiteSectionHead eyebrow="MEDIA COVERAGE" title="WHAT OTHERS ARE WRITING." size="md">
            <template #intro>
              Independent coverage of the forum and the trust agenda it carries, across the region.
            </template>
          </SiteSectionHead>

          <ul class="border-t border-ink/16">
            <li v-for="c in COVERAGE" :key="c.title" class="flex flex-col gap-2 border-b border-ink/16 py-5 lg:flex-row lg:items-center lg:gap-6">
              <span class="text-[11px] font-extrabold tracking-[0.1em] text-navy lg:w-[190px] lg:shrink-0">{{ c.outlet }}</span>
              <h3 class="flex-1 text-[17px] font-bold leading-[1.4] tracking-[-0.018em] text-ink">
                {{ c.title }}
              </h3>
              <span class="text-[12px] text-prose-dim lg:w-[130px] lg:shrink-0">{{ c.date }}</span>
              <UIcon name="i-lucide-arrow-up-right" class="size-4 shrink-0 text-navy" />
            </li>
          </ul>
        </div>
      </SiteContainer>
    </section>

    <!-- Speaker perspectives -->
    <section id="speaker-perspectives" class="bg-navy-deep py-20 lg:pb-[84px] lg:pt-20">
      <SiteContainer>
        <div class="flex flex-col gap-8">
          <SiteSectionHead eyebrow="SPEAKER PERSPECTIVES" title="SIGNED PIECES FROM THE PROGRAMME." size="md" dark col-class="lg:w-[680px]">
            <template #intro>
              Speakers write ahead of the forum, so the argument starts before anyone reaches Medan.
            </template>
          </SiteSectionHead>

          <ul class="grid gap-7 lg:grid-cols-3">
            <li v-for="p in SPEAKER_PIECES" :key="p.name" class="flex flex-col gap-5 border-t-2 border-white/24 pt-6">
              <h3 class="text-[22px] font-extrabold leading-[1.28] tracking-[-0.027em] text-white">
                {{ p.title }}
              </h3>
              <div class="flex items-center gap-3.5">
                <img :src="p.photo" :alt="p.name" width="46" height="46" loading="lazy" class="size-[46px] shrink-0 rounded-full object-cover">
                <div class="flex flex-col gap-1">
                  <span class="text-[14px] font-extrabold text-gold-soft">{{ p.name }}</span>
                  <span class="text-[12px] text-white/60">{{ p.role }}</span>
                </div>
              </div>
              <!-- Individual pieces are not published yet. -->
              <p class="flex items-center gap-2 text-[13px] font-bold text-white/35">
                Read the piece
                <UIcon name="i-lucide-arrow-right" class="size-3.5" />
              </p>
            </li>
          </ul>
        </div>
      </SiteContainer>
    </section>

    <!-- Partner stories -->
    <section id="partner-stories" class="bg-white py-20 lg:pb-[84px] lg:pt-20">
      <SiteContainer>
        <div class="flex flex-col gap-[30px]">
          <SiteSectionHead eyebrow="PARTNER STORIES" title="WHAT OUR PARTNERS ARE BUILDING." size="md" col-class="lg:w-[680px]">
            <template #intro>
              Reported stories from the institutions working with APCR — written as cases, not advertorials.
            </template>
          </SiteSectionHead>

          <ul class="grid gap-6 md:grid-cols-3">
            <li v-for="s in PARTNER_STORIES" :key="s.partner" class="flex flex-col justify-between gap-3.5 rounded-[2px] border border-ink/16 bg-paper-soft px-[26px] pb-7 pt-[26px]">
              <div class="flex flex-col gap-3.5">
                <span class="text-[10px] font-extrabold tracking-[0.11em] text-gold">{{ s.partner }}</span>
                <h3 class="text-[20px] font-extrabold leading-[1.22] tracking-[-0.025em] text-ink">
                  {{ s.title }}
                </h3>
                <p class="text-[14px] leading-[1.65] text-prose">
                  {{ s.copy }}
                </p>
              </div>
              <!-- Individual stories are not published yet. -->
              <p class="flex items-center gap-2 text-[13px] font-bold text-ink/35">
                Read the story
                <UIcon name="i-lucide-arrow-right" class="size-3.5" />
              </p>
            </li>
          </ul>
        </div>
      </SiteContainer>
    </section>

    <!-- Gallery -->
    <section id="gallery" class="border-t border-ink/16 py-20 lg:pb-20 lg:pt-[76px]">
      <SiteContainer>
        <div class="flex flex-col gap-7">
          <SiteSectionHead eyebrow="GALLERY" title="INSIDE THE FORUM." size="md">
            <template #action>
              <!-- The full gallery is still to come. -->
              <p class="flex items-center gap-2 text-[13px] font-bold text-ink/35">
                View all 214 photos
                <UIcon name="i-lucide-arrow-right" class="size-3.5" />
              </p>
            </template>
          </SiteSectionHead>

          <div class="flex flex-col gap-5">
            <div class="flex flex-col gap-5 lg:flex-row">
              <img :src="GALLERY[0]!.src" :alt="GALLERY[0]!.alt" loading="lazy" class="h-[220px] w-full rounded-[2px] object-cover lg:h-[300px] lg:flex-1">
              <img :src="GALLERY[1]!.src" :alt="GALLERY[1]!.alt" loading="lazy" class="h-[220px] w-full rounded-[2px] object-cover lg:h-[300px] lg:w-[380px] lg:shrink-0">
            </div>
            <div class="grid gap-5 sm:grid-cols-3">
              <img v-for="g in GALLERY.slice(2)" :key="g.src" :src="g.src" :alt="g.alt" loading="lazy" class="h-[200px] w-full rounded-[2px] object-cover">
            </div>
          </div>

          <p class="text-[12px] text-prose-dim">
            APCR pre-forum consultations, Jakarta and Medan, 2026. Photos: APCR Secretariat.
          </p>
        </div>
      </SiteContainer>
    </section>

    <!-- Media kit -->
    <section id="media-kit" class="bg-paper py-20 lg:pb-[84px] lg:pt-20">
      <SiteContainer>
        <div class="flex flex-col gap-8">
          <SiteSectionHead eyebrow="MEDIA KIT" title="EVERYTHING YOU NEED TO FILE." size="md" />

          <div class="flex flex-col gap-10 lg:flex-row lg:gap-12">
            <ul class="flex-1 rounded-[2px] border border-ink/16 bg-white px-7 pb-5 pt-2">
              <li v-for="m in MEDIA_KIT" :key="m.title" class="flex items-center gap-5 border-b border-ink/16 py-5">
                <div class="flex flex-1 flex-col gap-1.5">
                  <h3 class="text-[17px] font-extrabold leading-[1.3] tracking-[-0.018em] text-ink">
                    {{ m.title }}
                  </h3>
                  <p class="text-[13px] leading-[1.6] text-prose">
                    {{ m.copy }}
                  </p>
                </div>
                <span class="hidden w-[110px] shrink-0 text-right text-[12px] text-prose-dim sm:block">{{ m.file }}</span>
                <UIcon name="i-lucide-arrow-down" class="size-[17px] shrink-0 text-navy" />
              </li>
            </ul>

            <div class="flex flex-col gap-5 lg:w-[360px] lg:shrink-0">
              <div class="flex flex-col gap-3.5 rounded-[2px] bg-navy-deep px-[26px] pb-7 pt-[26px]">
                <p class="text-[11px] font-extrabold tracking-[0.118em] text-gold-soft">
                  MEDIA ACCREDITATION
                </p>
                <h3 class="text-[19px] font-extrabold leading-[1.28] tracking-[-0.026em] text-white">
                  Newsroom access, interview slots and embargoed releases
                </h3>
                <p class="text-[13px] leading-[1.7] text-white/70">
                  Applications close 20 November 2026. Decisions within five working days.
                </p>
                <SiteButton to="mailto:media@apcrforum.org" icon="i-lucide-arrow-right" class="mt-1 self-start">
                  Apply for accreditation
                </SiteButton>
              </div>

              <div class="flex flex-col gap-3 rounded-[2px] border border-ink/16 bg-white px-[26px] pb-[26px] pt-6">
                <p class="text-[11px] font-extrabold tracking-[0.118em] text-navy">
                  MEDIA CONTACT
                </p>
                <p class="text-[15px] font-bold text-ink">
                  APCR Secretariat · Communications Office
                </p>
                <p class="text-[13px] leading-[1.75] text-prose">
                  <a href="mailto:media@apcrforum.org" class="hover:underline">media@apcrforum.org</a><br>
                  +62 21 5050 1026<br>
                  Replies within two working days
                </p>
              </div>
            </div>
          </div>
        </div>
      </SiteContainer>
    </section>
  </div>
</template>
