<script setup lang="ts">
import { AT_A_GLANCE, COUNTRIES, TOPICS, WHATSAPP_DISPLAY } from '~/data/contact'
import { WHATSAPP_URL } from '~/data/site'
import { guestbookEntrySchema } from '~~/shared/schemas/guestbook'

definePageMeta({ layout: 'site' })

useSeoMeta({
  title: 'Contact',
  description: 'Contact APCR 2026 — the ASEAN Public Communication & Reputation Forum, 2–4 December 2026 in Medan, North Sumatra, Indonesia — via WhatsApp.',
  themeColor: '#031735'
})

const registerHref = await useRegisterHref('/apcr-2026#registration')

// guestbook entries are filed under the event the site features
const { data: publicEvents } = await useFetch('/api/public/events', { key: 'public-events' })
const featured = computed(() => publicEvents.value?.find(e => e.isDefault))

const form = reactive({ name: '', institution: '', position: '', country: '', email: '', topic: '', message: '' })

const whatsappHref = computed(() => {
  const body = [
    `Topic: ${form.topic || 'General enquiry'}`,
    `Name: ${form.name}`,
    `Institution: ${form.institution}`,
    `Position: ${form.position}`,
    `Country: ${form.country}`,
    `Email: ${form.email}`,
    '',
    form.message
  ].join('\n')
  return `${WHATSAPP_URL}?text=${encodeURIComponent(body)}`
})

const errors = ref<Partial<Record<keyof typeof form, string>>>({})
const sending = ref(false)
const sent = ref(false)
const sendError = ref('')

async function submit() {
  sendError.value = ''
  const parsed = guestbookEntrySchema.safeParse(form)
  if (!parsed.success) {
    errors.value = Object.fromEntries(parsed.error.issues.map(i => [i.path[0], i.message]))
    return
  }
  errors.value = {}
  if (!featured.value) return
  sending.value = true
  try {
    await $fetch(`/api/public/events/${featured.value.slug}/guestbook`, { method: 'POST', body: parsed.data })
    sent.value = true
  } catch (err) {
    sendError.value = (err as { statusMessage?: string }).statusMessage ?? 'Your message could not be sent. Please try again, or send it via WhatsApp.'
  } finally {
    sending.value = false
  }
}

function reset() {
  Object.assign(form, { name: '', institution: '', position: '', country: '', email: '', topic: '', message: '' })
  sent.value = false
}

const fieldClass = 'h-[46px] w-full rounded-[2px] border border-ink/16 bg-paper-soft px-3.5 text-[14px] text-ink placeholder:text-prose-dim'
const labelClass = 'text-[12px] font-bold text-ink'
const optionalClass = 'font-normal text-prose-dim'
const errorClass = 'text-[12px] text-error'
</script>

<template>
  <div>
    <SiteHero
      eyebrow="CONTACT"
      title="LET'S CONNECT."
      blurb="APCR is reached via WhatsApp. Message us directly, or fill in the form below and it will be composed as a WhatsApp message for you."
      title-class="text-[clamp(38px,6vw,72px)] leading-none tracking-[-0.047em]"
    >
      <template #actions>
        <SiteButton :to="WHATSAPP_URL" icon="i-lucide-arrow-up-right">
          Contact via WhatsApp
        </SiteButton>
      </template>
    </SiteHero>

    <!-- WhatsApp -->
    <section id="whatsapp" class="py-20 lg:pb-[76px] lg:pt-20">
      <SiteContainer>
        <div class="flex flex-col gap-[30px]">
          <SiteSectionHead eyebrow="WHO TO CONTACT" title="ONE CHANNEL: WHATSAPP.">
            <template #intro>
              Registration, partnership, media or anything else about APCR 2026 — send it to the same number.
            </template>
          </SiteSectionHead>

          <div class="flex flex-col gap-6 border-t border-ink/16 pt-[26px] md:flex-row md:items-center md:justify-between">
            <div class="flex items-center gap-4">
              <span class="flex size-12 shrink-0 items-center justify-center rounded-[2px] bg-navy-deep">
                <UIcon name="i-lucide-message-circle" class="size-[22px] text-gold-soft" />
              </span>
              <div class="flex flex-col gap-1">
                <p class="text-[11px] font-extrabold tracking-[0.118em] text-navy">
                  WHATSAPP
                </p>
                <a :href="WHATSAPP_URL" target="_blank" rel="noopener" class="text-[clamp(24px,2.7vw,32px)] font-extrabold leading-[1.12] tracking-[-0.038em] text-ink hover:underline">
                  {{ WHATSAPP_DISPLAY }}
                </a>
              </div>
            </div>
            <SiteButton :to="WHATSAPP_URL" variant="navy" icon="i-lucide-arrow-up-right" class="self-start md:self-auto">
              Contact via WhatsApp
            </SiteButton>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Message form -->
    <section id="message" class="bg-paper py-20 lg:pb-[86px] lg:pt-20">
      <SiteContainer>
        <div class="flex flex-col gap-10 lg:flex-row lg:gap-14">
          <div v-if="sent" class="flex flex-1 flex-col gap-[22px] rounded-[2px] border border-ink/16 bg-white px-6 pb-[42px] pt-10 sm:px-10" role="status">
            <SiteEyebrow>MESSAGE RECEIVED</SiteEyebrow>
            <h2 class="text-[clamp(24px,2.7vw,32px)] font-extrabold leading-[1.12] tracking-[-0.038em] text-ink">
              THANK YOU, {{ form.name.toUpperCase() }}.
            </h2>
            <p class="text-[15px] leading-[1.6] text-prose">
              Your message is in the {{ featured?.name }} guest book. For a faster reply, you can also send it to us on WhatsApp.
            </p>
            <div class="flex flex-wrap items-center gap-5 pt-1.5">
              <SiteButton :to="whatsappHref" variant="navy" icon="i-lucide-arrow-up-right">
                Also send via WhatsApp
              </SiteButton>
              <button type="button" class="text-[13px] font-bold text-navy hover:underline" @click="reset">
                Send another message
              </button>
            </div>
          </div>

          <form v-else class="flex flex-1 flex-col gap-[22px] rounded-[2px] border border-ink/16 bg-white px-6 pb-[42px] pt-10 sm:px-10" novalidate @submit.prevent="submit">
            <SiteEyebrow>SEND A MESSAGE</SiteEyebrow>
            <h2 class="text-[clamp(24px,2.7vw,32px)] font-extrabold leading-[1.12] tracking-[-0.038em] text-ink">
              TELL US WHAT YOU NEED.
            </h2>

            <div class="grid gap-[18px] sm:grid-cols-2">
              <div class="flex flex-col gap-2">
                <label :class="labelClass" for="c-name">Name</label>
                <input id="c-name" v-model="form.name" :class="fieldClass" placeholder="Your full name" autocomplete="name" required :aria-invalid="!!errors.name" :aria-describedby="errors.name && 'c-name-error'">
                <p v-if="errors.name" id="c-name-error" :class="errorClass">
                  {{ errors.name }}
                </p>
              </div>
              <div class="flex flex-col gap-2">
                <label :class="labelClass" for="c-email">Email</label>
                <input id="c-email" v-model="form.email" type="email" :class="fieldClass" placeholder="name@organisation.org" autocomplete="email" required :aria-invalid="!!errors.email" :aria-describedby="errors.email && 'c-email-error'">
                <p v-if="errors.email" id="c-email-error" :class="errorClass">
                  {{ errors.email }}
                </p>
              </div>
              <div class="flex flex-col gap-2">
                <label :class="labelClass" for="c-inst">Institution <span :class="optionalClass">(optional)</span></label>
                <input id="c-inst" v-model="form.institution" :class="fieldClass" placeholder="Ministry, company or university" autocomplete="organization">
              </div>
              <div class="flex flex-col gap-2">
                <label :class="labelClass" for="c-pos">Position <span :class="optionalClass">(optional)</span></label>
                <input id="c-pos" v-model="form.position" :class="fieldClass" placeholder="Your role" autocomplete="organization-title">
              </div>
              <div class="flex flex-col gap-2">
                <label :class="labelClass" for="c-country">Country <span :class="optionalClass">(optional)</span></label>
                <select id="c-country" v-model="form.country" :class="[fieldClass, !form.country && 'text-prose-dim']">
                  <option value="">
                    Select a country
                  </option>
                  <option v-for="c in COUNTRIES" :key="c" :value="c">
                    {{ c }}
                  </option>
                </select>
              </div>
              <div class="flex flex-col gap-2">
                <label :class="labelClass" for="c-topic">Topic <span :class="optionalClass">(optional)</span></label>
                <select id="c-topic" v-model="form.topic" :class="[fieldClass, !form.topic && 'text-prose-dim']">
                  <option value="">
                    Select a topic
                  </option>
                  <option v-for="t in TOPICS" :key="t" :value="t">
                    {{ t }}
                  </option>
                </select>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label :class="labelClass" for="c-message">Message <span :class="optionalClass">(optional)</span></label>
              <textarea
                id="c-message"
                v-model="form.message"
                rows="5"
                maxlength="5000"
                class="w-full rounded-[2px] border border-ink/16 bg-paper-soft px-3.5 py-3 text-[14px] text-ink placeholder:text-prose-dim"
                placeholder="Tell us briefly what you need."
              />
            </div>

            <p v-if="sendError" :class="errorClass" role="alert">
              {{ sendError }}
            </p>

            <!-- no featured event: there is no guest book to file the message under, so WhatsApp is the only way -->
            <div v-if="featured" class="flex flex-wrap items-center justify-between gap-5 pt-1.5">
              <SiteButton type="submit" variant="navy" icon="i-lucide-arrow-right" :disabled="sending">
                {{ sending ? 'Sending…' : 'Send message' }}
              </SiteButton>
              <a :href="whatsappHref" target="_blank" rel="noopener" class="text-[12px] text-prose-dim hover:underline">
                Prefer WhatsApp? Message {{ WHATSAPP_DISPLAY }}
              </a>
            </div>
            <div v-else class="flex flex-wrap items-center justify-between gap-5 pt-1.5">
              <SiteButton :to="whatsappHref" variant="navy" icon="i-lucide-arrow-up-right">
                Send via WhatsApp
              </SiteButton>
              <p class="text-[12px] text-prose-dim">
                Opens WhatsApp with your message ready to send to {{ WHATSAPP_DISPLAY }}
              </p>
            </div>
          </form>

          <aside class="flex flex-col gap-5 lg:w-[350px] lg:shrink-0">
            <div class="flex flex-col gap-4 rounded-[2px] bg-navy-deep px-6 pb-[26px] pt-6">
              <p class="text-[11px] font-extrabold tracking-[0.118em] text-gold-soft">
                APCR 2026 AT A GLANCE
              </p>
              <dl class="flex flex-col">
                <div
                  v-for="(row, i) in AT_A_GLANCE"
                  :key="row.label"
                  class="flex flex-col gap-1 py-3"
                  :class="i > 0 && 'border-t border-white/16'"
                >
                  <dt class="text-[12px] text-white/60">
                    {{ row.label }}
                  </dt>
                  <dd class="text-[15px] font-bold leading-[1.5] text-white">
                    {{ row.value }}
                  </dd>
                </div>
              </dl>
              <SiteButton :to="registerHref" icon="i-lucide-arrow-right" class="self-start">
                Register for APCR 2026
              </SiteButton>
            </div>
          </aside>
        </div>
      </SiteContainer>
    </section>
  </div>
</template>
