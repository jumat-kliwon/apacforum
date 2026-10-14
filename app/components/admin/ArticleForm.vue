<script setup lang="ts">
import type { EditorToolbarItem, FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
import { articleFormSchema, slugify, type ArticleForm, type ArticleFormInput } from '~~/shared/schemas/article'

/** Article editor: content on the left, publishing, thumbnail and SEO on the right. Used by "Write article" and "Edit article". */
type Previews = { thumbnail?: string | null, ogImage?: string | null }
const props = defineProps<{ initial?: ArticleFormInput, previews?: Previews, saving?: boolean, articleId?: string, isLive?: boolean }>()
const emit = defineEmits<{ submit: [ArticleForm] }>()

const config = useRuntimeConfig()
const siteUrl = String(config.public.siteUrl || '').replace(/\/$/, '')

const state = reactive<ArticleFormInput>(props.initial
  ? structuredClone(toRaw(props.initial))
  : {
      title: '', slug: '', excerpt: '', content: '', thumbnailKey: null, status: 'draft', publishedAt: '',
      seoTitle: '', seoDescription: '', seoKeywords: '', ogImageKey: null, canonicalUrl: '', noIndex: false
    })

// Suggest the slug from the title until it is edited by hand.
const slugTouched = ref(!!props.initial)
watch(() => state.title, (title) => {
  if (!slugTouched.value) state.slug = slugify(title)
})

const toolbar: EditorToolbarItem[][] = [
  [
    { kind: 'undo', icon: 'i-lucide-undo-2', tooltip: { text: 'Undo' } },
    { kind: 'redo', icon: 'i-lucide-redo-2', tooltip: { text: 'Redo' } }
  ],
  [
    {
      icon: 'i-lucide-heading',
      tooltip: { text: 'Headings' },
      content: { align: 'start' },
      items: [
        { kind: 'paragraph', label: 'Paragraph', icon: 'i-lucide-type' },
        { kind: 'heading', level: 2, label: 'Heading 2', icon: 'i-lucide-heading-2' },
        { kind: 'heading', level: 3, label: 'Heading 3', icon: 'i-lucide-heading-3' },
        { kind: 'heading', level: 4, label: 'Heading 4', icon: 'i-lucide-heading-4' }
      ]
    }
  ],
  [
    { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold', tooltip: { text: 'Bold' } },
    { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic', tooltip: { text: 'Italic' } },
    { kind: 'mark', mark: 'underline', icon: 'i-lucide-underline', tooltip: { text: 'Underline' } },
    { kind: 'mark', mark: 'strike', icon: 'i-lucide-strikethrough', tooltip: { text: 'Strikethrough' } },
    { kind: 'link', icon: 'i-lucide-link', tooltip: { text: 'Link' } }
  ],
  [
    { kind: 'bulletList', icon: 'i-lucide-list', tooltip: { text: 'Bullet list' } },
    { kind: 'orderedList', icon: 'i-lucide-list-ordered', tooltip: { text: 'Numbered list' } },
    { kind: 'blockquote', icon: 'i-lucide-text-quote', tooltip: { text: 'Quote' } },
    { kind: 'horizontalRule', icon: 'i-lucide-separator-horizontal', tooltip: { text: 'Divider' } }
  ],
  [
    { kind: 'clearFormatting', icon: 'i-lucide-remove-formatting', tooltip: { text: 'Clear formatting' } }
  ]
]

// ── SEO preview (falls back to the article itself, like the public page) ──
const plainContent = computed(() => (state.content ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
const previewTitle = computed(() => state.seoTitle || state.title || 'Article title')
const previewDescription = computed(() => state.seoDescription || state.excerpt || plainContent.value.slice(0, 160) || 'The meta description shows here.')
const previewUrl = computed(() => `${siteUrl.replace(/^https?:\/\//, '')} › news › ${state.slug || 'article-slug'}`)
const wordCount = computed(() => plainContent.value ? plainContent.value.split(' ').length : 0)
const counter = (v: string | null | undefined, max: number) => `${(v ?? '').length}/${max}`

const submitAs = ref<'draft' | 'published'>('draft')
const form = useTemplateRef('form')
async function save(status: 'draft' | 'published') {
  submitAs.value = status
  state.status = status
  await form.value?.submit()
}
function onSubmit(e: FormSubmitEvent<ArticleForm>) {
  emit('submit', e.data)
}
function onError(e: FormErrorEvent) {
  const first = e.errors[0]
  if (first?.id) document.getElementById(first.id)?.focus()
}
</script>

<template>
  <UForm ref="form" :schema="articleFormSchema" :state="state" class="flex flex-col gap-6" @submit="onSubmit" @error="onError">
    <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <!-- Content -->
      <div class="flex min-w-0 flex-col gap-6">
        <AdminPanel title="Content">
          <UFormField label="Title" name="title" required>
            <UInput v-model="state.title" placeholder="A clear, specific headline" size="xl" class="w-full" :ui="{ base: 'text-lg font-semibold' }" />
          </UFormField>
          <UFormField label="Slug" name="slug" required :help="`Public page: /news/${state.slug || 'your-slug'}`">
            <UInput v-model="state.slug" placeholder="article-slug" class="w-full font-mono" :ui="{ base: 'ps-17' }" @update:model-value="slugTouched = true">
              <template #leading>
                <span class="text-sm text-muted">/news/</span>
              </template>
            </UInput>
          </UFormField>
          <UFormField label="Excerpt" name="excerpt" hint="Optional" help="One or two sentences for the News list and social previews.">
            <UTextarea v-model="state.excerpt!" :rows="2" :maxlength="500" placeholder="What is this article about?" class="w-full" />
          </UFormField>
          <UFormField label="Body" name="content" :help="`${formatNumber(wordCount)} ${wordCount === 1 ? 'word' : 'words'}`">
            <div class="overflow-hidden rounded-md border border-default focus-within:border-(--ui-primary)">
              <UEditor
                v-slot="{ editor }"
                v-model="state.content"
                content-type="html"
                :image="false"
                :mention="false"
                placeholder="Write the article…"
                class="article-content min-h-[420px] w-full"
                :ui="{ base: 'px-4 py-4 sm:px-6' }"
              >
                <UEditorToolbar :editor="editor" :items="toolbar" class="overflow-x-auto border-b border-default bg-default px-2 py-1.5" />
              </UEditor>
            </div>
          </UFormField>
        </AdminPanel>

        <!-- SEO -->
        <AdminPanel title="SEO" description="Leave a field empty to use the article's own title, excerpt and thumbnail.">
          <div class="flex flex-col gap-1 rounded-md border border-default bg-muted p-4" aria-label="Search result preview">
            <span class="text-[11px] font-medium uppercase tracking-[1.1px] text-muted">Search preview</span>
            <span class="truncate text-xs text-toned">{{ previewUrl }}</span>
            <span class="line-clamp-1 text-lg/6 text-[#1a0dab]">{{ previewTitle }}</span>
            <span class="line-clamp-2 text-[13px]/5 text-toned">{{ previewDescription }}</span>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Meta title" name="seoTitle" :hint="counter(state.seoTitle, 70)" class="sm:col-span-2">
              <UInput v-model="state.seoTitle!" :maxlength="70" :placeholder="state.title || 'Defaults to the title'" class="w-full" />
            </UFormField>
            <UFormField label="Meta description" name="seoDescription" :hint="counter(state.seoDescription, 160)" class="sm:col-span-2">
              <UTextarea v-model="state.seoDescription!" :rows="2" :maxlength="160" :placeholder="state.excerpt || 'Defaults to the excerpt'" class="w-full" />
            </UFormField>
            <UFormField label="Keywords" name="seoKeywords" hint="Optional" help="Comma separated.">
              <UInput v-model="state.seoKeywords!" placeholder="reputation, ASEAN, trust" class="w-full" />
            </UFormField>
            <UFormField label="Canonical URL" name="canonicalUrl" hint="Optional" help="Only when the article was first published elsewhere.">
              <UInput v-model="state.canonicalUrl!" type="url" placeholder="https://" class="w-full" />
            </UFormField>
          </div>
          <div class="grid gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
            <AdminImageUpload v-model="state.ogImageKey" folder="articles" :preview-url="previews?.ogImage" label="Social share image" hint="1200×630, defaults to the thumbnail" variant="banner" />
            <div class="flex items-start justify-between gap-4 self-start rounded-md border border-default p-4">
              <div>
                <p class="text-sm font-medium text-highlighted">
                  Hide from search engines
                </p>
                <p class="text-[13px]/[18px] text-muted">
                  Adds <code class="font-mono">noindex</code>. The article stays reachable by its link.
                </p>
              </div>
              <USwitch v-model="state.noIndex" aria-label="Hide from search engines" />
            </div>
          </div>
        </AdminPanel>
      </div>

      <!-- Sidebar -->
      <div class="flex flex-col gap-6 lg:sticky lg:top-22">
        <AdminPanel title="Publishing">
          <div class="flex items-center justify-between gap-2 text-sm">
            <span class="text-muted">Status</span>
            <UBadge v-bind="PUBLISH_STATUS[initial?.status ?? 'draft']" />
          </div>
          <UFormField label="Publish date" name="publishedAt" hint="Optional" help="WIB. Empty = when you publish. A future date schedules the article.">
            <UInput v-model="state.publishedAt!" type="datetime-local" class="w-full" />
          </UFormField>
        </AdminPanel>
        <AdminPanel title="Thumbnail">
          <AdminImageUpload v-model="state.thumbnailKey" folder="articles" :preview-url="previews?.thumbnail" label="Thumbnail" hint="JPG, PNG or WebP, 1600×900, 5 MB at most" variant="banner" />
        </AdminPanel>
      </div>
    </div>

    <div class="sticky bottom-0 z-10 -mx-4 -mb-10 flex flex-wrap items-center gap-3 border-t border-default bg-default px-4 py-4 sm:-mx-8 sm:px-8">
      <span class="flex items-center gap-2 text-[13px]/[18px] text-muted">
        <UIcon name="i-lucide-info" class="size-4" />
        {{ isLive ? 'This article is live on the website.' : 'Drafts are not visible on the website.' }}
      </span>
      <div class="ml-auto flex flex-wrap gap-2">
        <UButton to="/admin/news" color="neutral" variant="ghost" label="Cancel" />
        <UButton color="neutral" variant="outline" :label="isLive ? 'Unpublish' : 'Save as draft'" :loading="saving && submitAs === 'draft'" @click="save('draft')" />
        <UButton :label="isLive ? 'Update' : 'Publish'" :loading="saving && submitAs === 'published'" @click="save('published')" />
      </div>
    </div>
  </UForm>
</template>
