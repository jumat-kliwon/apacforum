<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  // a malformed id is a 404 before anything loads
  validate: route => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(route.params.eventId))
})

const route = useRoute()
const { load } = useAdminEvents()
const last = useLastEventId()

/**
 * Every page below needs an existing event; remember it so /admin opens it next time.
 * An event the cached list knows opens at once while the list refreshes behind it (another tab or admin
 * may have created or deleted events since); one the list does not know is looked up first.
 */
async function enter(id: string) {
  const { events: cached } = useAdminEvents()
  const known = cached.value?.some(e => e.id === id)
  if (known) {
    load(true).catch(() => {})
  } else {
    const events = await load(true)
    if (!events.some(e => e.id === id)) throw createError({ statusCode: 404, statusMessage: 'Event not found', fatal: true })
  }
  last.value = id
}

await enter(String(route.params.eventId))
watch(() => route.params.eventId, id => enter(String(id)).catch(showError))
</script>

<template>
  <NuxtPage />
</template>
