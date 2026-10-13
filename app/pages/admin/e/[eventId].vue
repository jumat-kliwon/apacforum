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

/** Every page below needs an existing event; remember it so /admin opens it next time. */
async function enter(id: string) {
  const events = await load()
  if (!events.some(e => e.id === id)) throw createError({ statusCode: 404, statusMessage: 'Event not found', fatal: true })
  last.value = id
}

await enter(String(route.params.eventId))
watch(() => route.params.eventId, id => enter(String(id)).catch(showError))
</script>

<template>
  <NuxtPage />
</template>
