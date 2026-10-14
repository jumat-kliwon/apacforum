<script setup lang="ts">
const route = useRoute()
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const pageSize = 9
const { data } = await useFetch('/api/public/articles', { query: computed(() => ({ page: page.value, pageSize })) })

const config = useRuntimeConfig()
const siteUrl = String(config.public.siteUrl || '').replace(/\/$/, '')
useSeoMeta({
  title: 'News & Media',
  description: 'News, press releases and media coverage from the ASEAN Public Communication & Reputation Forum (APCR).',
  ogTitle: 'News & Media · APCR',
  ogType: 'website'
})
useHead({ link: [{ rel: 'canonical', href: `${siteUrl}/news${page.value > 1 ? `?page=${page.value}` : ''}` }] })

const rows = computed(() => data.value?.rows ?? [])
// the newest article gets a large card on the first page
const lead = computed(() => (page.value === 1 ? rows.value[0] : undefined))
const grid = computed(() => (lead.value ? rows.value.slice(1) : rows.value))
</script>

<template>
  <header class="flex flex-col gap-2">
    <span class="text-[11px] font-medium uppercase tracking-[1.1px] text-muted">APCR</span>
    <h1 class="text-[32px]/10 font-bold tracking-tight text-highlighted sm:text-[40px]/12">
      News &amp; Media
    </h1>
    <p class="max-w-2xl text-muted">
      News, press releases and media coverage from the ASEAN Public Communication &amp; Reputation Forum.
    </p>
  </header>

  <div v-if="!rows.length" class="rounded-lg border border-default bg-default p-10">
    <UEmpty icon="i-lucide-newspaper" title="No articles yet" description="Check back soon for news from APCR." />
  </div>

  <template v-else>
    <NuxtLink v-if="lead" :to="`/news/${lead.slug}`" class="group grid overflow-hidden rounded-lg border border-default bg-default shadow-xs md:grid-cols-2">
      <div class="aspect-video bg-elevated md:aspect-auto">
        <img v-if="lead.thumbnailUrl" :src="lead.thumbnailUrl" :alt="lead.title" class="size-full object-cover">
        <div v-else class="flex size-full min-h-56 items-center justify-center text-muted">
          <UIcon name="i-lucide-newspaper" class="size-10" />
        </div>
      </div>
      <div class="flex flex-col justify-center gap-3 p-6 sm:p-8">
        <time v-if="lead.publishedAt" :datetime="String(lead.publishedAt)" class="text-sm text-muted">{{ formatDate(lead.publishedAt) }}</time>
        <h2 class="text-2xl/8 font-bold text-highlighted group-hover:underline">
          {{ lead.title }}
        </h2>
        <p v-if="lead.excerpt" class="line-clamp-3 text-default">
          {{ lead.excerpt }}
        </p>
        <span class="mt-2 flex items-center gap-1 text-sm font-semibold text-primary">Read article <UIcon name="i-lucide-arrow-right" class="size-4" /></span>
      </div>
    </NuxtLink>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink v-for="a in grid" :key="a.id" :to="`/news/${a.slug}`" class="group flex flex-col overflow-hidden rounded-lg border border-default bg-default shadow-xs">
        <div class="aspect-video bg-elevated">
          <img v-if="a.thumbnailUrl" :src="a.thumbnailUrl" :alt="a.title" loading="lazy" class="size-full object-cover">
          <div v-else class="flex size-full items-center justify-center text-muted">
            <UIcon name="i-lucide-newspaper" class="size-8" />
          </div>
        </div>
        <div class="flex grow flex-col gap-2 p-5">
          <time v-if="a.publishedAt" :datetime="String(a.publishedAt)" class="text-[13px] text-muted">{{ formatDate(a.publishedAt) }}</time>
          <h2 class="line-clamp-2 text-lg/6 font-semibold text-highlighted group-hover:underline">
            {{ a.title }}
          </h2>
          <p v-if="a.excerpt" class="line-clamp-3 text-sm text-muted">
            {{ a.excerpt }}
          </p>
        </div>
      </NuxtLink>
    </div>

    <div v-if="(data?.total ?? 0) > pageSize" class="flex justify-center">
      <UPagination :page="page" :total="data?.total ?? 0" :items-per-page="pageSize" :to="(p: number) => ({ query: { page: p > 1 ? p : undefined } })" />
    </div>
  </template>
</template>
