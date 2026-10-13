<script setup lang="ts">
import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
import { eventFormSchema, type EventForm, type EventFormInput } from '~~/shared/schemas/event'

/**
 * One-page event form: details, agenda, speakers, partners, tickets.
 * Used by "Add event" and "Edit event".
 */
type Previews = { banner?: string | null, speakers: (string | null)[], partners: (string | null)[] }
const props = defineProps<{ initial?: EventFormInput, previews?: Previews, saving?: boolean, eventId?: string }>()
const emit = defineEmits<{ submit: [EventForm] }>()

const blankDay = () => ({ label: '', date: '', theme: '', body: '' })
const blankSpeaker = () => ({ name: '', title: '', category: 'government' as const, agendaDayIndex: null, status: 'published' as const, photoKey: null })
const blankPartner = () => ({ name: '', category: 'strategic' as const, logoKey: null })
const blankTicket = () => ({ code: '', name: '', price: 0, paxPerTicket: 1, quota: 0, isOnSale: true })

const state = reactive<EventFormInput>(props.initial
  ? structuredClone(toRaw(props.initial))
  : {
      name: '', code: '', slug: '', tagline: '', description: '', startDate: '', endDate: '', registrationDeadline: '',
      venueName: '', venueAddress: '', city: '', capacity: 0, bannerKey: null, registrationOpen: true, status: 'draft',
      agendaDays: [blankDay()], speakers: [blankSpeaker()], partners: [blankPartner()], ticketTypes: [blankTicket()]
    })
const previews = reactive<Previews>(props.previews ? structuredClone(toRaw(props.previews)) : { banner: null, speakers: [null], partners: [null] })

// Suggest the slug and code from the name until they are edited by hand.
const slugTouched = ref(!!props.initial)
const codeTouched = ref(!!props.initial)
watch(() => state.name, (name) => {
  if (!slugTouched.value) state.slug = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  if (!codeTouched.value) state.code = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
})

const days = computed(() => state.agendaDays!)
const speakers = computed(() => state.speakers!)
const partners = computed(() => state.partners!)
const tickets = computed(() => state.ticketTypes!)

function addSpeaker() {
  speakers.value.push(blankSpeaker())
  previews.speakers.push(null)
}
function removeSpeaker(i: number) {
  speakers.value.splice(i, 1)
  previews.speakers.splice(i, 1)
}
function addPartner() {
  partners.value.push(blankPartner())
  previews.partners.push(null)
}
function removePartner(i: number) {
  partners.value.splice(i, 1)
  previews.partners.splice(i, 1)
}
function removeDay(i: number) {
  days.value.splice(i, 1)
  // keep speaker sessions pointing at the same day
  for (const s of speakers.value) {
    if (s.agendaDayIndex == null) continue
    if (s.agendaDayIndex === i) s.agendaDayIndex = null
    else if (s.agendaDayIndex > i) s.agendaDayIndex -= 1
  }
}

const dayItems = computed(() => [
  { label: 'No session', value: -1 },
  ...days.value.map((d, i) => ({ label: `Day ${i + 1}${d.label ? ` · ${d.label}` : ''}`, value: i }))
])
const dayModel = (s: { agendaDayIndex?: number | null }) => computed({
  get: () => s.agendaDayIndex ?? -1,
  set: (v: number) => { s.agendaDayIndex = v < 0 ? null : v }
})

const submitAs = ref<'draft' | 'published'>('draft')
const form = useTemplateRef('form')
async function save(status: 'draft' | 'published') {
  submitAs.value = status
  state.status = status
  await form.value?.submit()
}
function onSubmit(e: FormSubmitEvent<EventForm>) {
  emit('submit', e.data)
}
function onError(e: FormErrorEvent) {
  const first = e.errors[0]
  if (first?.id) document.getElementById(first.id)?.focus()
}

const SPEAKER_ITEMS = toItems(SPEAKER_CATEGORY)
const PARTNER_ITEMS = toItems(PARTNER_CATEGORY)
</script>

<template>
  <UForm ref="form" :schema="eventFormSchema" :state="state" class="flex flex-col gap-6" @submit="onSubmit" @error="onError">
    <!-- 1. General details -->
    <AdminPanel title="1. General details" description="Shown on the event page and in participant emails.">
      <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Event name" name="name" required class="sm:col-span-2">
            <UInput v-model="state.name" placeholder="For example: APCR 2027" class="w-full" />
          </UFormField>
          <UFormField label="Tagline" name="tagline" hint="Optional" class="sm:col-span-2">
            <UInput v-model="state.tagline!" placeholder="One short sentence about the event" class="w-full" />
          </UFormField>
          <UFormField label="Event code" name="code" required help="Prefix for registration, invoice and e-ticket numbers.">
            <UInput v-model="state.code" placeholder="APCR" class="w-full font-mono uppercase" @update:model-value="codeTouched = true" />
          </UFormField>
          <UFormField label="Slug" name="slug" required help="Public page: /events/your-slug">
            <UInput v-model="state.slug" placeholder="apcr-2027" class="w-full font-mono" @update:model-value="slugTouched = true" />
          </UFormField>
          <UFormField label="Start date" name="startDate" required>
            <UInput v-model="state.startDate" type="date" class="w-full" />
          </UFormField>
          <UFormField label="End date" name="endDate" required>
            <UInput v-model="state.endDate" type="date" class="w-full" />
          </UFormField>
          <UFormField label="Registration deadline" name="registrationDeadline" required help="Closes at 23:59 WIB on this day.">
            <UInput v-model="state.registrationDeadline" type="date" class="w-full" />
          </UFormField>
          <UFormField label="Capacity" name="capacity" required>
            <UInput v-model.number="state.capacity" type="number" min="0" class="w-full" :ui="{ base: 'pe-28' }">
              <template #trailing>
                <span class="flex h-full items-center border-l border-default pl-2 text-sm font-medium text-toned">participants</span>
              </template>
            </UInput>
          </UFormField>
          <UFormField label="Venue" name="venueName" required>
            <UInput v-model="state.venueName" placeholder="Venue name" class="w-full" />
          </UFormField>
          <UFormField label="City" name="city" required>
            <UInput v-model="state.city" placeholder="City" class="w-full" />
          </UFormField>
          <UFormField label="Address" name="venueAddress" hint="Optional" class="sm:col-span-2">
            <UInput v-model="state.venueAddress!" placeholder="Street address" class="w-full" />
          </UFormField>
          <UFormField label="Description" name="description" class="sm:col-span-2">
            <UTextarea v-model="state.description" :rows="4" placeholder="Describe the goals, audience and topics of the event" class="w-full" />
          </UFormField>
        </div>
        <div class="flex flex-col gap-4">
          <AdminImageUpload v-model="state.bannerKey" folder="events" :preview-url="previews.banner" label="Event banner" hint="JPG, PNG or WebP, 1920×1080, 5 MB at most" variant="banner" />
          <div class="flex items-start justify-between gap-4 rounded-md border border-default p-4">
            <div>
              <p class="text-sm font-medium text-highlighted">
                Open registration
              </p>
              <p class="text-[13px]/[18px] text-muted">
                The registration form accepts participants as soon as the event is published.
              </p>
            </div>
            <USwitch v-model="state.registrationOpen" aria-label="Open registration" />
          </div>
        </div>
      </div>
    </AdminPanel>

    <!-- 2. Agenda -->
    <AdminPanel title="2. Agenda" description="One block per event day.">
      <template #actions>
        <UButton color="neutral" variant="outline" icon="i-lucide-plus" label="Add day" @click="days.push(blankDay())" />
      </template>
      <div v-for="(d, i) in days" :key="i" class="flex flex-col gap-4 rounded-md border border-default p-4">
        <div class="flex items-center justify-between">
          <h3 class="text-[15px]/5 font-semibold text-highlighted">
            Day {{ i + 1 }}
          </h3>
          <UButton color="error" variant="ghost" icon="i-lucide-trash-2" :aria-label="`Remove day ${i + 1}`" @click="removeDay(i)" />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Day label" :name="`agendaDays.${i}.label`">
            <UInput v-model="d.label" placeholder="For example: SUMATRA" class="w-full" />
          </UFormField>
          <UFormField label="Date" :name="`agendaDays.${i}.date`">
            <UInput v-model="d.date" type="date" class="w-full" />
          </UFormField>
          <UFormField label="Theme" :name="`agendaDays.${i}.theme`" class="sm:col-span-2">
            <UInput v-model="d.theme" placeholder="The main theme of the day" class="w-full" />
          </UFormField>
          <UFormField label="Content" :name="`agendaDays.${i}.body`" class="sm:col-span-2">
            <UTextarea v-model="d.body" :rows="3" placeholder="Topics and sessions covered" class="w-full" />
          </UFormField>
        </div>
      </div>
      <p v-if="!days.length" class="text-sm text-muted">
        No agenda yet.
      </p>
    </AdminPanel>

    <!-- 3. Speakers -->
    <AdminPanel title="3. Speakers" description="Only published speakers appear on the website.">
      <template #actions>
        <UButton color="neutral" variant="outline" icon="i-lucide-plus" label="Add speaker" @click="addSpeaker" />
      </template>
      <div v-for="(s, i) in speakers" :key="i" class="flex flex-wrap items-end gap-4 rounded-md border border-default p-4">
        <AdminImageUpload v-model="s.photoKey" folder="speakers" :preview-url="previews.speakers[i]" :label="`Speaker ${i + 1} photo`" variant="square" />
        <div class="grid min-w-0 grow gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <UFormField label="Name" :name="`speakers.${i}.name`">
            <UInput v-model="s.name" placeholder="Full name and title" class="w-full" />
          </UFormField>
          <UFormField label="Position & institution" :name="`speakers.${i}.title`">
            <UInput v-model="s.title" placeholder="For example: CCO, Straits Capital Group" class="w-full" />
          </UFormField>
          <UFormField label="Category" :name="`speakers.${i}.category`">
            <USelect v-model="s.category" :items="SPEAKER_ITEMS" class="w-full" />
          </UFormField>
          <UFormField label="Session" :name="`speakers.${i}.agendaDayIndex`">
            <USelect v-model="dayModel(s).value" :items="dayItems" class="w-full" />
          </UFormField>
        </div>
        <div class="flex h-11 items-center gap-3">
          <USwitch :model-value="s.status === 'published'" label="Published" @update:model-value="v => s.status = v ? 'published' : 'draft'" />
          <UButton color="error" variant="ghost" icon="i-lucide-trash-2" :aria-label="`Remove speaker ${s.name || i + 1}`" @click="removeSpeaker(i)" />
        </div>
      </div>
    </AdminPanel>

    <!-- 4. Partners -->
    <AdminPanel title="4. Partners" description="Partner logos appear by category on the website.">
      <template #actions>
        <UButton color="neutral" variant="outline" icon="i-lucide-plus" label="Add partner" @click="addPartner" />
      </template>
      <div v-for="(p, i) in partners" :key="i" class="flex flex-wrap items-end gap-4 rounded-md border border-default p-4">
        <AdminImageUpload v-model="p.logoKey" folder="partners" :preview-url="previews.partners[i]" :label="`Partner ${i + 1} logo`" variant="square" />
        <div class="grid min-w-0 grow gap-4 sm:grid-cols-2">
          <UFormField label="Partner name" :name="`partners.${i}.name`">
            <UInput v-model="p.name" placeholder="Organization name" class="w-full" />
          </UFormField>
          <UFormField label="Category" :name="`partners.${i}.category`">
            <USelect v-model="p.category" :items="PARTNER_ITEMS" class="w-full" />
          </UFormField>
        </div>
        <UButton color="error" variant="ghost" icon="i-lucide-trash-2" class="mb-1" :aria-label="`Remove partner ${p.name || i + 1}`" @click="removePartner(i)" />
      </div>
    </AdminPanel>

    <!-- 5. Tickets -->
    <AdminPanel title="5. Tickets" description="Ticket types become the participant types on the registration form.">
      <template #actions>
        <UButton color="neutral" variant="outline" icon="i-lucide-plus" label="Add ticket type" @click="tickets.push(blankTicket())" />
      </template>
      <UFormField name="ticketTypes" />
      <div v-for="(t, i) in tickets" :key="i" class="flex flex-wrap items-end gap-4 rounded-md border border-default p-4">
        <div class="grid min-w-0 grow gap-4 sm:grid-cols-2 xl:grid-cols-[2fr_1fr_1.4fr_1fr_1fr]">
          <UFormField label="Ticket type name" :name="`ticketTypes.${i}.name`">
            <UInput v-model="t.name" placeholder="For example: Indonesia Delegate" class="w-full" />
          </UFormField>
          <UFormField label="Code" :name="`ticketTypes.${i}.code`">
            <UInput v-model="t.code" placeholder="ID" class="w-full font-mono uppercase" />
          </UFormField>
          <UFormField label="Price" :name="`ticketTypes.${i}.price`">
            <UInput v-model.number="t.price" type="number" min="0" class="w-full" :ui="{ base: 'ps-13' }">
              <template #leading>
                <span class="flex h-full items-center border-r border-default pr-2 text-sm font-medium text-toned">Rp</span>
              </template>
            </UInput>
          </UFormField>
          <UFormField label="People per ticket" :name="`ticketTypes.${i}.paxPerTicket`">
            <UInput v-model.number="t.paxPerTicket" type="number" min="1" class="w-full" />
          </UFormField>
          <UFormField label="Quota" :name="`ticketTypes.${i}.quota`">
            <UInput v-model.number="t.quota" type="number" min="0" class="w-full" />
          </UFormField>
        </div>
        <div class="flex h-11 items-center gap-3">
          <USwitch v-model="t.isOnSale" label="On sale" />
          <UButton color="error" variant="ghost" icon="i-lucide-trash-2" :aria-label="`Remove ticket type ${t.name || i + 1}`" @click="tickets.splice(i, 1)" />
        </div>
      </div>
    </AdminPanel>

    <div class="sticky bottom-0 z-10 -mx-4 -mb-10 flex flex-wrap items-center gap-3 border-t border-default bg-default px-4 py-4 sm:-mx-8 sm:px-8">
      <span class="flex items-center gap-2 text-[13px]/[18px] text-muted">
        <UIcon name="i-lucide-info" class="size-4" />
        {{ state.status === 'published' && eventId ? 'This event is live on the website.' : 'Drafts are not visible on the website.' }}
      </span>
      <div class="ml-auto flex flex-wrap gap-2">
        <UButton :to="eventId ? `/admin/events/${eventId}` : '/admin/events'" color="neutral" variant="ghost" label="Cancel" />
        <UButton color="neutral" variant="outline" label="Save as draft" :loading="saving && submitAs === 'draft'" @click="save('draft')" />
        <UButton :label="eventId ? 'Save and publish' : 'Publish event'" :loading="saving && submitAs === 'published'" @click="save('published')" />
      </div>
    </div>
  </UForm>
</template>
