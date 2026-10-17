<script setup lang="ts">
import type { ArticleForm, ArticleFormInput } from '~~/shared/schemas/article'

definePageMeta({ layout: 'focus', middleware: 'admin', permission: 'news.manage', backTo: '/admin/news' })

const route = useRoute()
const notify = useNotify()
const id = String(route.params.id)
const { data, error, refresh } = await useFetch(`/api/admin/articles/${id}`)

/** A timestamp as the value of a datetime-local input, in WIB. */
const toWibInput = (d: string | Date | null) => d ? new Date(new Date(d).getTime() + 7 * 3600_000).toISOString().slice(0, 16) : ''

const initial = computed<ArticleFormInput | undefined>(() => {
  const a = data.value
  if (!a) return undefined
  return {
    title: a.title, slug: a.slug, excerpt: a.excerpt ?? '', content: a.content, thumbnailKey: a.thumbnailKey,
    status: a.status, publishedAt: toWibInput(a.publishedAt),
    seoTitle: a.seoTitle ?? '', seoDescription: a.seoDescription ?? '', seoKeywords: a.seoKeywords ?? '',
    ogImageKey: a.ogImageKey, canonicalUrl: a.canonicalUrl ?? '', noIndex: a.noIndex
  }
})
const isLive = computed(() => data.value?.status === 'published')
// re-mount the form after each save so it starts from what the server stored
const version = ref(0)

const saving = ref(false)
async function update(form: ArticleForm) {
  saving.value = true
  try {
    await $fetch(`/api/admin/articles/${id}`, { method: 'PUT', body: form })
    notify.success(form.status === 'published' ? (isLive.value ? 'Article updated' : 'Article published') : (isLive.value ? 'Article unpublished' : 'Draft saved'))
    await refresh()
    version.value++
  } catch (err) {
    notify.error(err, 'Could not save the article')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="error" class="rounded-lg border border-default bg-default p-10">
    <UEmpty icon="i-lucide-file-x" title="Article not found" :actions="[{ label: 'Back to News & Media', to: '/admin/news' }]" />
  </div>
  <template v-else-if="data && initial">
    <AdminPageHeader title="Edit article">
      <template #badges>
        <UBadge v-bind="PUBLISH_STATUS[data.status]" />
      </template>
      <template #description>
        Created {{ formatDateTime(data.createdAt) }}{{ data.authorName ? ` by ${data.authorName}` : '' }} · Last updated {{ formatDateTime(data.updatedAt) }}
      </template>
      <template #actions>
        <UButton v-if="isLive" :to="`/news/${data.slug}`" target="_blank" color="neutral" variant="outline" icon="i-lucide-external-link" label="View on website" />
      </template>
    </AdminPageHeader>
    <AdminArticleForm
      :key="version"
      :initial="initial"
      :previews="{ thumbnail: data.thumbnailUrl, ogImage: data.ogImageUrl }"
      :article-id="id"
      :is-live="isLive"
      :saving="saving"
      @submit="update"
    />
  </template>
</template>
