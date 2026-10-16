<script setup lang="ts">
import type { EditorToolbarItem, FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
import { agendaDaySchema, eventFormSchema, type EventForm, type EventFormInput } from '~~/shared/schemas/event'

/**
 * Event form in two steps: details and agenda. Ticket types, speakers and partners live on the
 * event's Tickets, Speakers and Partners pages. "Add event" opens each step in order; "Edit event" starts with every step reachable.
 */
type Previews = { banner?: string | null }
const props = defineProps<{ initial?: EventFormInput, previews?: Previews, saving?: boolean, eventId?: string }>()
const emit = defineEmits<{ submit: [EventForm] }>()

const blankDay = () => ({ label: '', date: '', theme: '', body: '' })

const state = reactive<EventFormInput>(props.initial
  ? { ...structuredClone(toRaw(props.initial)), description: descriptionToHtml(props.initial.description) }
  : {
      name: '', code: '', slug: '', tagline: '', description: '', startDate: '', endDate: '', registrationDeadline: '',
      venueName: '', venueAddress: '', city: '', capacity: 0, bannerKey: null, registrationOpen: true, isDefault: false, status: 'draft',
      agendaDays: [blankDay()]
    })
const previews = reactive<Previews>(props.previews ? structuredClone(toRaw(props.previews)) : { banner: null })

// Suggest the slug and code from the name until they are edited by hand.
const slugTouched = ref(!!props.initial)
const codeTouched = ref(!!props.initial)
watch(() => state.name, (name) => {
  if (!slugTouched.value) state.slug = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  if (!codeTouched.value) state.code = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
})

const days = computed(() => state.agendaDays!)
// a removed day leaves its speakers without a session
function removeDay(i: number) {
  days.value.splice(i, 1)
}

// Steps follow the sections. A list step owns every `<list>.<i>.<field>` name.
const STEPS = [
  {
    title: 'General details',
    fields: ['name', 'code', 'slug', 'tagline', 'description', 'startDate', 'endDate', 'registrationDeadline', 'venueName', 'venueAddress', 'city', 'capacity', 'bannerKey', 'registrationOpen', 'isDefault']
  },
  { title: 'Agenda', list: 'agendaDays', itemFields: Object.keys(agendaDaySchema.shape) }
] as const

const step = ref(0)
const isLast = computed(() => step.value === STEPS.length - 1)
// The furthest step that can be opened from the header. A new event unlocks steps one by one
// through "Next"; an existing event already has every step filled in.
const reached = ref(props.eventId ? STEPS.length - 1 : 0)
const stepItems = computed(() => STEPS.map((s, i) => ({
  title: s.title,
  icon: i !== step.value && (i < reached.value || props.eventId) ? 'i-lucide-check' : undefined,
  disabled: i > reached.value
})))

function stepFieldNames(i: number): string[] {
  const s = STEPS[i]!
  if (!('list' in s)) return [...s.fields]
  const rows = (state[s.list] ?? []) as unknown[]
  return [s.list, ...rows.flatMap((_, r) => s.itemFields.map(f => `${s.list}.${r}.${f}`))]
}
function stepOf(name: string) {
  const root = name.split('.')[0]
  return STEPS.findIndex(s => 'list' in s ? s.list === root : (s.fields as readonly string[]).includes(root!))
}

const stepTop = useTemplateRef('stepTop')
// moving forward checks the step being left; going back never blocks
async function goTo(i: number) {
  if (i > step.value) {
    // validate() also matches nested paths such as `agendaDays.0.label`; its type only lists top-level keys
    const name = stepFieldNames(step.value) as (keyof EventFormInput)[]
    const ok = await form.value?.validate({ name, silent: true })
    if (ok === false) return focusFirstError()
  }
  step.value = i
  reached.value = Math.max(reached.value, i)
  nextTick(() => stepTop.value?.scrollIntoView({ block: 'start', behavior: 'smooth' }))
}

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
function focusFirstError() {
  const first = form.value?.getErrors()[0]
  if (first?.id) nextTick(() => document.getElementById(first.id!)?.focus())
}
function onError(e: FormErrorEvent) {
  const first = e.errors[0]
  // a save can fail on a field in another step: open that step first
  if (first?.name) {
    const i = stepOf(first.name)
    if (i >= 0 && i !== step.value) step.value = i
  }
  if (first?.id) nextTick(() => document.getElementById(first.id!)?.focus())
}

// the markup server/utils/sanitizeDescription.ts keeps
const DESCRIPTION_TOOLBAR: EditorToolbarItem[][] = [
  [
    { kind: 'heading', level: 2, icon: 'i-lucide-heading-2', 'aria-label': 'Heading' },
    { kind: 'heading', level: 3, icon: 'i-lucide-heading-3', 'aria-label': 'Subheading' }
  ],
  [
    { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold', 'aria-label': 'Bold' },
    { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic', 'aria-label': 'Italic' },
    { kind: 'mark', mark: 'underline', icon: 'i-lucide-underline', 'aria-label': 'Underline' },
    { kind: 'mark', mark: 'strike', icon: 'i-lucide-strikethrough', 'aria-label': 'Strikethrough' },
    { kind: 'link', icon: 'i-lucide-link', 'aria-label': 'Link' }
  ],
  [
    { kind: 'bulletList', icon: 'i-lucide-list', 'aria-label': 'Bulleted list' },
    { kind: 'orderedList', icon: 'i-lucide-list-ordered', 'aria-label': 'Numbered list' },
    { kind: 'blockquote', icon: 'i-lucide-text-quote', 'aria-label': 'Quote' }
  ],
  [
    { kind: 'undo', icon: 'i-lucide-undo-2', 'aria-label': 'Undo' },
    { kind: 'redo', icon: 'i-lucide-redo-2', 'aria-label': 'Redo' }
  ]
]

</script>

<template>
  <UForm ref="form" :schema="eventFormSchema" :state="state" class="flex grow flex-col gap-6" @submit="onSubmit" @error="onError">
    <div ref="stepTop" class="scroll-mt-6">
      <AdminPanel>
        <UStepper
          :model-value="step"
          :items="stepItems"
          size="sm"
          :linear="false"
          @update:model-value="v => goTo(Number(v))"
        />
      </AdminPanel>
    </div>

    <!-- 1. General details -->
    <AdminPanel v-show="step === 0" :title="STEPS[0].title" description="Shown on the event page and in participant emails.">
      <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div class="grid gap-5 sm:grid-cols-2">
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
            <!-- styled as a Core Field: 1px border-secondary, radius 12, gold border while editing -->
            <div class="overflow-hidden rounded-[12px] ring ring-inset ring-slate-300 transition-colors hover:ring-slate-400 focus-within:ring-brand-700 hover:focus-within:ring-brand-700 dark:ring-[#3e4045] dark:focus-within:ring-brand-400">
              <UEditor
                v-slot="{ editor }"
                v-model="state.description"
                content-type="html"
                placeholder="Describe the goals, audience and topics of the event"
                :ui="{ base: 'min-h-36 px-3 py-2.5 sm:px-3 text-sm/5 *:my-3 [&_p]:leading-5 [&_h2]:text-lg [&_h3]:text-base' }"
              >
                <UEditorToolbar
                  :editor="editor"
                  :items="DESCRIPTION_TOOLBAR"
                  class="flex-wrap gap-y-1 border-b border-default bg-muted px-1.5 py-1"
                />
              </UEditor>
            </div>
          </UFormField>
        </div>
        <div class="flex flex-col gap-4">
          <AdminImageUpload v-model="state.bannerKey" folder="events" :preview-url="previews.banner" label="Event banner" hint="JPG, PNG or WebP, 1920×1080, 5 MB at most" variant="banner" />
          <div class="flex items-start justify-between gap-4 rounded-sm border border-default p-4">
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
          <div class="flex items-start justify-between gap-4 rounded-sm border border-default p-4">
            <div>
              <p class="text-sm font-medium text-highlighted">
                Default event
              </p>
              <p class="text-[13px]/[18px] text-muted">
                Only one event can be the default. Turning this on removes it from the current default.
              </p>
            </div>
            <USwitch v-model="state.isDefault" aria-label="Default event" />
          </div>
        </div>
      </div>
    </AdminPanel>

    <!-- 2. Agenda -->
    <AdminPanel v-show="step === 1" :title="STEPS[1].title" description="One block per event day.">
      <template #actions>
        <UButton color="neutral" variant="outline" icon="i-lucide-plus" label="Add day" @click="days.push(blankDay())" />
      </template>
      <div v-for="(d, i) in days" :key="i" class="flex flex-col gap-4 rounded-sm border border-default p-4">
        <div class="flex items-center justify-between">
          <h3 class="text-[15px]/5 font-semibold text-highlighted">
            Day {{ i + 1 }}
          </h3>
          <UButton color="error" variant="ghost" icon="i-lucide-trash-2" :aria-label="`Remove day ${i + 1}`" @click="removeDay(i)" />
        </div>
        <div class="grid gap-5 sm:grid-cols-2">
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

    <div class="sticky bottom-0 z-10 -mx-4 -mb-10 mt-auto flex flex-wrap items-center gap-3 border-t border-default bg-default px-4 py-4 sm:-mx-8 sm:px-8">
      <span class="flex items-center gap-2 text-[13px]/[18px] text-muted">
        <UIcon name="i-lucide-info" class="size-4" />
        Step {{ step + 1 }} of {{ STEPS.length }} ·
        {{ !eventId ? 'The event is saved as a draft. Add ticket types next, then publish it.' : state.status === 'published' ? 'This event is live on the website.' : 'Drafts are not visible on the website.' }}
      </span>
      <div class="ml-auto flex flex-wrap gap-2">
        <UButton :to="eventId ? eventPath(eventId, 'settings') : '/admin/events'" color="neutral" variant="ghost" label="Cancel" />
        <UButton v-if="eventId || !isLast" color="neutral" variant="outline" label="Save as draft" :loading="saving && submitAs === 'draft'" @click="save('draft')" />
        <UButton v-if="step > 0" color="neutral" variant="outline" icon="i-lucide-arrow-left" label="Back" @click="goTo(step - 1)" />
        <!-- an existing event can be saved from any step, so Next steps back from primary -->
        <UButton v-if="!isLast" :color="eventId ? 'neutral' : 'primary'" :variant="eventId ? 'outline' : 'solid'" trailing-icon="i-lucide-arrow-right" label="Next" @click="goTo(step + 1)" />
        <UButton v-if="eventId" label="Save and publish" :loading="saving && submitAs === 'published'" @click="save('published')" />
        <!-- publishing needs a ticket type, so a new event is created as a draft -->
        <UButton v-else-if="isLast" label="Create event" :loading="saving" @click="save('draft')" />
      </div>
    </div>
  </UForm>
</template>
