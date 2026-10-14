<script setup lang="ts">
import type { ArticleForm } from '~~/shared/schemas/article'

definePageMeta({ layout: 'focus', middleware: 'admin', backTo: '/admin/news' })

const notify = useNotify()
const saving = ref(false)

async function create(form: ArticleForm) {
  saving.value = true
  try {
    const { id } = await $fetch('/api/admin/articles', { method: 'POST', body: form })
    notify.success(form.status === 'published' ? 'Article published' : 'Draft saved')
    await navigateTo(`/admin/news/${id}`, { replace: true })
  } catch (err) {
    notify.error(err, 'Could not save the article')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AdminPageHeader title="Write article" description="News, press releases and media coverage for the News page." />
  <AdminArticleForm :saving="saving" @submit="create" />
</template>
