<script setup lang="ts">
/**
 * Uploads an image straight to Cloudflare R2 through a presigned URL.
 * The image is scaled down and re-encoded in the browser first, so large photos fit the 5 MB limit.
 * `v-model` = object key; `previewUrl` = URL of the image already saved.
 */
const key = defineModel<string | null | undefined>({ default: null })
const props = defineProps<{
  folder: 'events' | 'speakers' | 'partners' | 'articles'
  previewUrl?: string | null
  label: string
  hint?: string
  variant?: 'banner' | 'square'
}>()

const notify = useNotify()
const config = useRuntimeConfig()
const uploading = ref(false)
const localPreview = ref<string | null>(null)
const input = useTemplateRef<HTMLInputElement>('input')

const shown = computed(() => {
  if (localPreview.value) return localPreview.value
  if (!key.value) return null
  if (props.previewUrl) return props.previewUrl
  const base = String(config.public.r2PublicUrl || '').replace(/\/$/, '')
  return base ? `${base}/${key.value}` : null
})

async function onChange(e: Event) {
  const picked = (e.target as HTMLInputElement).files?.[0]
  if (!picked) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(picked.type)) {
    notify.error({ data: { statusMessage: 'Only JPG, PNG or WebP' } }, 'File type not supported')
    return
  }
  uploading.value = true
  try {
    const file = await compressImage(picked, MAX_IMAGE_SIDE[props.variant === 'banner' ? 'banner' : 'square'])
    if (file.size > 5 * 1024 * 1024) {
      notify.error({ data: { statusMessage: '5 MB at most, even after compression' } }, 'File is too large')
      return
    }
    const res = await $fetch('/api/admin/uploads', { method: 'POST', body: { folder: props.folder, contentType: file.type, size: file.size } })
    const put = await fetch(res.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
    if (!put.ok) throw new Error(`Upload failed (${put.status})`)
    localPreview.value = URL.createObjectURL(file)
    key.value = res.key
  } catch (err) {
    notify.error(err, 'Upload failed')
  } finally {
    uploading.value = false
    if (input.value) input.value.value = ''
  }
}

function clear() {
  key.value = null
  localPreview.value = null
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <span v-if="variant === 'banner'" class="text-sm/5 font-medium text-highlighted">{{ label }}</span>
    <div
      class="relative flex items-center justify-center overflow-hidden rounded-sm border border-dashed border-accented bg-muted"
      :class="variant === 'banner' ? 'aspect-video w-full' : 'size-20 shrink-0'"
    >
      <img v-if="shown" :src="shown" :alt="label" class="absolute inset-0 size-full object-cover">
      <label class="relative z-10 flex cursor-pointer flex-col items-center gap-1 rounded-sm p-3 text-center focus-within:outline-2 focus-within:outline-(--focus-ring)" :class="shown ? 'bg-default/90 shadow-sm' : ''">
        <UIcon :name="uploading ? 'i-lucide-loader-circle' : 'i-lucide-upload'" class="size-5 text-muted" :class="{ 'animate-spin': uploading }" />
        <span v-if="variant === 'banner'" class="text-sm font-medium text-highlighted">{{ shown ? 'Replace image' : 'Upload image' }}</span>
        <span v-else class="sr-only">{{ label }}</span>
        <span v-if="hint && variant === 'banner'" class="text-xs text-muted">{{ hint }}</span>
        <input ref="input" type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" :aria-label="label" :disabled="uploading" @change="onChange">
      </label>
    </div>
    <UButton v-if="key && variant === 'banner'" color="neutral" variant="link" size="xs" label="Remove image" class="self-start p-0" @click="clear" />
  </div>
</template>
