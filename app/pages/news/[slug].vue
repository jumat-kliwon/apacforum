<script setup lang="ts">
definePageMeta({ layout: 'site' })

const route = useRoute()
const slug = String(route.params.slug)
const { data, error } = await useFetch(`/api/public/articles/${slug}`)
if (error.value) throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })

const a = computed(() => data.value!.article)
const config = useRuntimeConfig()
const siteUrl = String(config.public.siteUrl || '').replace(/\/$/, '')
const url = computed(() => a.value.seo.canonicalUrl || `${siteUrl}/news/${a.value.slug}`)
const published = computed(() => a.value.publishedAt ? new Date(a.value.publishedAt).toISOString() : undefined)
const modified = computed(() => new Date(a.value.updatedAt).toISOString())

useSeoMeta({
  title: () => a.value.seo.title,
  description: () => a.value.seo.description || undefined,
  robots: () => (a.value.seo.noIndex ? 'noindex, follow' : 'index, follow'),
  ogType: 'article',
  ogTitle: () => a.value.seo.title,
  ogDescription: () => a.value.seo.description || undefined,
  ogImage: () => a.value.seo.image ?? undefined,
  ogUrl: () => url.value,
  ogSiteName: 'APCR',
  articlePublishedTime: () => published.value,
  articleModifiedTime: () => modified.value,
  articleAuthor: () => (a.value.authorName ? [a.value.authorName] : undefined),
  twitterCard: () => (a.value.seo.image ? 'summary_large_image' : 'summary'),
  twitterTitle: () => a.value.seo.title,
  twitterDescription: () => a.value.seo.description || undefined,
  twitterImage: () => a.value.seo.image ?? undefined
})
useHead({
  link: [{ rel: 'canonical', href: url }],
  meta: [{ name: 'keywords', content: () => a.value.seo.keywords || undefined }],
  script: [{
    type: 'application/ld+json',
    // `<` escaped so article text can never close the script tag
    innerHTML: () => JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      'headline': a.value.title,
      'description': a.value.seo.description || undefined,
      'image': a.value.seo.image ? [a.value.seo.image] : undefined,
      'datePublished': published.value,
      'dateModified': modified.value,
      'author': a.value.authorName ? { '@type': 'Person', 'name': a.value.authorName } : undefined,
      'publisher': { '@type': 'Organization', 'name': 'APCR — ASEAN Public Communication & Reputation Forum' },
      'mainEntityOfPage': url.value
    }).replace(/</g, '\\u003c')
  }]
})
</script>

<template>
  <SiteContainer class="py-12 lg:py-16">
    <article v-if="data" class="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <UBreadcrumb :items="[{ label: 'News & Media', to: '/news' }, { label: a.title }]" :ui="{ link: 'text-[13px]', item: 'min-w-0', linkLabel: 'truncate' }" />
      <header class="flex flex-col gap-3">
        <h1 class="text-[32px]/10 font-bold tracking-tight text-highlighted sm:text-[40px]/12">
          {{ a.title }}
        </h1>
        <p v-if="a.excerpt" class="text-lg text-muted">
          {{ a.excerpt }}
        </p>
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <time v-if="a.publishedAt" :datetime="published">{{ formatDate(a.publishedAt) }}</time>
          <span v-if="a.authorName">By {{ a.authorName }}</span>
        </div>
      </header>
      <img v-if="a.thumbnailUrl" :src="a.thumbnailUrl" :alt="a.title" class="aspect-video w-full rounded-lg border border-default object-cover">
      <!-- admin-authored HTML, sanitised on save -->
      <div class="article-content rounded-lg border border-default bg-default p-6 shadow-xs sm:p-10">
        <div class="prose" v-html="a.content" />
      </div>

      <section v-if="data.more.length" aria-labelledby="more" class="mt-4 flex flex-col gap-4">
        <h2 id="more" class="text-xl font-semibold text-highlighted">
          More news
        </h2>
        <div class="grid gap-4 sm:grid-cols-3">
          <NuxtLink v-for="m in data.more" :key="m.id" :to="`/news/${m.slug}`" class="group flex flex-col overflow-hidden rounded-lg border border-default bg-default shadow-xs">
            <div class="aspect-video bg-elevated">
              <img v-if="m.thumbnailUrl" :src="m.thumbnailUrl" :alt="m.title" loading="lazy" class="size-full object-cover">
            </div>
            <div class="flex flex-col gap-1 p-4">
              <time v-if="m.publishedAt" class="text-xs text-muted">{{ formatDate(m.publishedAt) }}</time>
              <span class="line-clamp-2 text-sm font-semibold text-highlighted group-hover:underline">{{ m.title }}</span>
            </div>
          </NuxtLink>
        </div>
      </section>
    </article>
  </SiteContainer>
</template>
