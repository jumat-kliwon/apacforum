<script setup lang="ts">
import { QrcodeStream } from 'vue-qrcode-reader'

/** Public ticket scanner for one event. The link (with its key) comes from the event page in the admin panel. */
const route = useRoute()
const notify = useNotify()
const id = String(route.params.id)
const key = String(route.query.key ?? '')

const { data: ev, error } = await useFetch(`/api/public/scan/${id}`, { query: { key } })
useHead({ title: () => ev.value ? `Scanner · ${ev.value.name}` : 'Ticket scanner', meta: [{ name: 'robots', content: 'noindex' }] })

// ── check-in ──
type Result = Awaited<ReturnType<typeof checkIn>>
const RESULT_UI = {
  checked_in: { title: 'Checked in', icon: 'i-lucide-circle-check', text: 'text-success', box: 'border-success/40 bg-success/10' },
  already: { title: 'Already checked in', icon: 'i-lucide-circle-alert', text: 'text-warning', box: 'border-warning/40 bg-warning/10' },
  invalid: { title: 'Not valid', icon: 'i-lucide-circle-x', text: 'text-error', box: 'border-error/40 bg-error/10' },
  not_found: { title: 'Unknown ticket', icon: 'i-lucide-circle-x', text: 'text-error', box: 'border-error/40 bg-error/10' }
} as const

const last = ref<Result | null>(null)
const history = ref<(Result & { at: Date })[]>([])
const busy = ref(false)

function checkIn(code: string) {
  return $fetch(`/api/public/scan/${id}`, { method: 'POST', body: { key, code } })
}

// the camera reports the same code many times a second; ignore repeats for a moment
let lastCode = ''
let lastAt = 0
async function submit(code: string) {
  const value = code.trim()
  if (!value || busy.value) return
  if (value === lastCode && Date.now() - lastAt < 3000) return
  lastCode = value
  lastAt = Date.now()

  busy.value = true
  try {
    const res = await checkIn(value)
    last.value = res
    history.value = [{ ...res, at: new Date() }, ...history.value].slice(0, 20)
    navigator.vibrate?.(res.result === 'checked_in' ? 80 : [60, 60, 60])
  } catch (err) {
    notify.error(err, 'Could not check the ticket')
  } finally {
    busy.value = false
  }
}

function onDetect(codes: { rawValue: string }[]) {
  const code = codes[0]?.rawValue
  if (code) submit(code)
}

// ── manual entry ──
const manual = ref('')
async function submitManual() {
  lastCode = ''
  await submit(manual.value)
  manual.value = ''
}

// ── camera ──
const cameraOn = ref(true)
const cameraReady = ref(false)
const cameraError = ref<string | null>(null)
const CAMERA_ERRORS: Record<string, string> = {
  NotAllowedError: 'Camera access was blocked. Allow the camera for this site in the browser settings, then reload.',
  NotFoundError: 'No camera was found on this device.',
  NotSupportedError: 'The camera needs a secure (HTTPS) connection.',
  InsecureContextError: 'The camera needs a secure (HTTPS) connection.',
  NotReadableError: 'The camera is in use by another app.',
  OverconstrainedError: 'This device has no suitable camera.',
  StreamApiNotSupportedError: 'This browser cannot use the camera.'
}
function onCameraError(err: { name: string, message: string }) {
  cameraReady.value = false
  cameraError.value = CAMERA_ERRORS[err.name] ?? err.message
}
function toggleCamera() {
  cameraOn.value = !cameraOn.value
  cameraError.value = null
}
</script>

<template>
  <div v-if="error" class="rounded-md border border-default bg-default p-10">
    <UEmpty icon="i-lucide-link-2-off" title="Scanner link not valid" :description="errorMessage(error, 'Ask the organiser for a new scanner link.')" />
  </div>

  <template v-else-if="ev">
    <header class="flex flex-col gap-1">
      <p class="text-[13px] font-medium uppercase tracking-[1.1px] text-muted">
        Ticket scanner
      </p>
      <h1 class="text-[28px]/9 font-bold tracking-tight text-highlighted">
        {{ ev.name }}
      </h1>
      <p class="text-sm text-muted">
        {{ formatDateRange(ev.startDate, ev.endDate) }} · {{ ev.venueName }}, {{ ev.city }}
      </p>
    </header>

    <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <AdminPanel title="Camera">
        <template #actions>
          <UButton
            color="neutral"
            variant="outline"
            size="sm"
            :icon="cameraOn ? 'i-lucide-video-off' : 'i-lucide-video'"
            :label="cameraOn ? 'Stop camera' : 'Start camera'"
            @click="toggleCamera"
          />
        </template>

        <div class="relative aspect-square w-full overflow-hidden rounded-sm bg-inverted/90 sm:aspect-video lg:aspect-square">
          <QrcodeStream
            v-if="cameraOn && !cameraError"
            :constraints="{ facingMode: 'environment' }"
            :paused="busy"
            @detect="onDetect"
            @camera-on="cameraReady = true"
            @camera-off="cameraReady = false"
            @error="onCameraError"
          >
            <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div class="size-3/5 rounded-md border-2 border-white/80 shadow-[0_0_0_9999px_rgb(0_0_0/0.35)]" />
            </div>
            <div v-if="busy" class="absolute inset-0 flex items-center justify-center bg-black/30">
              <UIcon name="i-lucide-loader-circle" class="size-10 animate-spin text-white" />
            </div>
          </QrcodeStream>

          <div v-if="!cameraOn || cameraError || !cameraReady" class="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-inverted">
            <UIcon :name="cameraError ? 'i-lucide-camera-off' : cameraOn ? 'i-lucide-loader-circle' : 'i-lucide-video-off'" class="size-10" :class="{ 'animate-spin': cameraOn && !cameraError }" />
            <p class="max-w-72 text-sm">
              {{ cameraError ?? (cameraOn ? 'Starting the camera…' : 'Camera is off.') }}
            </p>
          </div>
        </div>

        <form class="flex gap-2" @submit.prevent="submitManual">
          <UInput v-model="manual" icon="i-lucide-keyboard" placeholder="Or type the ticket code, e.g. APCR26-ID-0712" aria-label="Ticket code" class="grow" :ui="{ base: 'font-mono uppercase' }" />
          <UButton type="submit" label="Check in" :loading="busy" :disabled="!manual.trim()" />
        </form>
      </AdminPanel>

      <div class="flex flex-col gap-6">
        <AdminPanel title="Result">
          <div v-if="!last" class="py-6">
            <UEmpty icon="i-lucide-scan-line" title="Waiting for a ticket" description="Hold the QR code inside the frame." />
          </div>
          <div v-else role="status" aria-live="polite" class="flex flex-col gap-4 rounded-sm border p-5" :class="RESULT_UI[last.result].box">
            <div class="flex items-center gap-3">
              <UIcon :name="RESULT_UI[last.result].icon" class="size-9 shrink-0" :class="RESULT_UI[last.result].text" />
              <div class="min-w-0">
                <p class="text-xl font-bold text-highlighted">
                  {{ RESULT_UI[last.result].title }}
                </p>
                <p class="text-sm text-muted">
                  {{ last.message }}
                </p>
              </div>
            </div>

            <dl v-if="last.ticket" class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 text-sm">
              <dt class="text-muted">
                Participant
              </dt>
              <dd class="font-semibold text-highlighted">
                {{ last.ticket.name }}
                <span v-if="last.ticket.organization" class="block text-xs font-normal text-muted">{{ last.ticket.organization }}</span>
              </dd>
              <dt class="text-muted">
                Participant type
              </dt>
              <dd><UBadge color="neutral" variant="outline" :label="last.ticket.ticketTypeName" /></dd>
              <dt class="text-muted">
                Ticket
              </dt>
              <dd class="font-mono text-[13px] text-highlighted">
                {{ last.ticket.ticketCode }}
              </dd>
              <template v-if="last.ticket.checkedInAt">
                <dt class="text-muted">
                  Checked in
                </dt>
                <dd class="text-highlighted tabular-nums">
                  {{ formatDateTime(last.ticket.checkedInAt) }}
                </dd>
              </template>
            </dl>
            <p v-else class="font-mono text-[13px] text-muted">
              {{ last.code }}
            </p>
          </div>
        </AdminPanel>

        <AdminPanel title="Recent scans" description="This device only, cleared when the page reloads.">
          <p v-if="!history.length" class="text-sm text-muted">
            No scans yet.
          </p>
          <ul v-else class="-my-2 divide-y divide-default">
            <li v-for="(h, i) in history" :key="i" class="flex items-center gap-3 py-2">
              <UIcon :name="RESULT_UI[h.result].icon" class="size-5 shrink-0" :class="RESULT_UI[h.result].text" />
              <div class="min-w-0 grow">
                <p class="truncate text-sm font-medium text-highlighted">
                  {{ h.ticket?.name ?? h.code }}
                </p>
                <p class="truncate text-xs text-muted">
                  {{ RESULT_UI[h.result].title }}<template v-if="h.ticket">
                    · {{ h.ticket.ticketTypeName }}
                  </template>
                </p>
              </div>
              <span class="shrink-0 text-xs text-muted tabular-nums">{{ formatTime(h.at) }}</span>
            </li>
          </ul>
        </AdminPanel>
      </div>
    </div>
  </template>
</template>
