<script setup lang="ts">
import type { Step } from '~/utils/registrationProgress'

const props = defineProps<{ steps: Step[] }>()

const STATE_TEXT = { done: 'done', current: 'current step', upcoming: 'not yet', failed: 'stopped here' } as const

// the line after a step is gold once the next step is reached
const lineDone = (i: number) => props.steps[i + 1]?.state === 'done'
</script>

<template>
  <ol aria-label="Registration progress" class="flex flex-col gap-3 sm:grid sm:grid-cols-5 sm:gap-0">
    <li
      v-for="(s, i) in steps"
      :key="s.key"
      :aria-current="s.state === 'current' ? 'step' : undefined"
      class="relative flex items-center gap-3 sm:flex-col sm:gap-2 sm:text-center"
    >
      <span
        v-if="i < steps.length - 1"
        aria-hidden="true"
        class="absolute top-4 left-[calc(50%+1.25rem)] hidden h-0.5 w-[calc(100%-2.5rem)] rounded-full sm:block"
        :class="lineDone(i) ? 'bg-brand-400' : 'bg-(--ui-border)'"
      />
      <span
        class="relative flex size-8 shrink-0 items-center justify-center rounded-full"
        :class="{
          'bg-brand-400 text-(--brand-ink)': s.state === 'done',
          'bg-default ring-2 ring-brand-400': s.state === 'current',
          'bg-red-600 text-white': s.state === 'failed',
          'bg-default ring-1 ring-(--ui-border-accented)': s.state === 'upcoming'
        }"
      >
        <UIcon v-if="s.state === 'done'" name="i-lucide-check" class="size-4" />
        <UIcon v-else-if="s.state === 'failed'" name="i-lucide-x" class="size-4" />
        <span v-else-if="s.state === 'current'" class="size-2.5 rounded-full bg-brand-400" />
      </span>
      <span class="flex min-w-0 flex-col">
        <span class="text-sm font-medium" :class="s.state === 'upcoming' ? 'text-muted' : 'text-highlighted'">
          {{ s.label }}<span class="sr-only">: {{ STATE_TEXT[s.state] }}</span>
        </span>
        <span class="text-xs text-muted tabular-nums">
          <template v-if="s.at">{{ formatDate(s.at, 'short') }}</template>
          <template v-else-if="s.state === 'current'">Waiting</template>
          <template v-else>&nbsp;</template>
        </span>
      </span>
    </li>
  </ol>
</template>
