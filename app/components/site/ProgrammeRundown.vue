<script setup lang="ts">
import { PROGRAMME } from '~/data/programme-rundown'

/** The APCR 2026 rundown: one tab per day, each with its question, theme and hour-by-hour table. */
const activeDay = ref(PROGRAMME[0]!.id)
const day = computed(() => PROGRAMME.find(d => d.id === activeDay.value)!)
</script>

<template>
  <div class="flex flex-col gap-[34px]">
    <div role="tablist" aria-label="APCR 2026 programme days" class="flex flex-col border-b border-ink/16 sm:flex-row">
      <button
        v-for="d in PROGRAMME"
        :id="`journey-tab-${d.id}`"
        :key="d.id"
        type="button"
        role="tab"
        :aria-selected="d.id === activeDay"
        :aria-controls="`journey-panel-${d.id}`"
        class="-mb-px border-b-2 px-1 py-4 text-left text-[12px] font-extrabold tracking-[0.1em] transition-colors sm:mr-8"
        :class="d.id === activeDay ? 'border-gold text-navy' : 'border-transparent text-prose hover:text-ink'"
        @click="activeDay = d.id"
      >
        {{ d.date }}
      </button>
    </div>

    <div :id="`journey-panel-${day.id}`" role="tabpanel" :aria-labelledby="`journey-tab-${day.id}`" class="flex flex-col gap-8">
      <div class="flex flex-col gap-3">
        <p class="text-[12px] font-extrabold tracking-[0.1em] text-gold">
          {{ day.date }}
        </p>
        <h3 class="text-[clamp(24px,3vw,34px)] font-extrabold leading-[1.1] tracking-[-0.035em] text-ink">
          {{ day.question }}
        </h3>
        <p class="text-[17px] font-extrabold tracking-[-0.01em] text-navy">
          {{ day.name }}
        </p>
        <p class="text-[12px] font-extrabold tracking-[0.1em] text-prose">
          {{ day.theme }}
        </p>
        <p class="max-w-[860px] text-[16px] leading-[1.7] text-prose">
          {{ day.summary }}
        </p>
      </div>

      <div class="overflow-x-auto rounded-[2px] border border-ink/16 bg-white">
        <table class="w-full min-w-[640px] text-left">
          <caption class="sr-only">
            APCR 2026 {{ day.date.split(' — ')[0]!.toLowerCase() }} programme
          </caption>
          <thead>
            <tr class="border-b border-ink/16 bg-paper text-[11px] font-extrabold tracking-[0.1em] text-navy">
              <th scope="col" class="w-[130px] px-5 py-3">
                TIME
              </th>
              <th scope="col" class="px-5 py-3">
                AGENDA
              </th>
              <th scope="col" class="px-5 py-3" :class="day.rows.some(r => r.speakers) ? 'w-[36%]' : 'w-[170px]'">
                FORMAT / SPEAKERS
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in day.rows"
              :key="`${row.time}-${row.title}`"
              class="border-b border-ink/16 align-top last:border-b-0"
              :class="row.group && 'bg-navy-deep'"
            >
              <td class="whitespace-nowrap px-5 py-4 text-[13px] font-bold tabular-nums" :class="row.group ? 'text-gold-soft' : 'text-navy'">
                {{ row.time }}
              </td>
              <td class="px-5 py-4">
                <p class="text-[15px] font-extrabold leading-[1.4]" :class="row.group ? 'text-white' : 'text-ink'">
                  {{ row.title }}
                </p>
                <p v-for="line in row.details" :key="line" class="mt-1 text-[14px] leading-[1.6]" :class="row.group ? 'text-white/70' : 'text-prose'">
                  {{ line }}
                </p>
                <ul v-if="row.issues" class="mt-2 flex flex-col gap-1">
                  <li v-for="issue in row.issues" :key="issue" class="flex gap-2 text-[13px] leading-[1.6] text-prose">
                    <span class="mt-2 size-1 shrink-0 rounded-full bg-gold" />
                    {{ issue }}
                  </li>
                </ul>
              </td>
              <td class="px-5 py-4 text-[13px] leading-[1.6]" :class="row.group ? 'text-white/50' : 'text-prose'">
                <ul v-if="row.speakers" class="flex flex-col gap-1.5">
                  <li v-for="s in row.speakers" :key="s">
                    {{ s }}
                  </li>
                </ul>
                <span v-else-if="!row.group" class="text-prose-dim">TBC</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="text-[13px] text-prose">
        Speakers and institutional participation: TBC.
      </p>
    </div>
  </div>
</template>
