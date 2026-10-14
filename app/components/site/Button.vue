<script setup lang="ts">
/**
 * The four button treatments used across the public site. `to` renders a
 * NuxtLink, an absolute `to` or a `mailto:` renders a plain anchor, and
 * neither renders a button — so a call to action with no destination yet
 * still looks right without pretending to be a link.
 */
const props = withDefaults(defineProps<{
  to?: string
  variant?: 'gold' | 'navy' | 'light' | 'dark'
  size?: 'md' | 'lg'
  icon?: string
}>(), { variant: 'gold', size: 'md' })

const VARIANTS = {
  gold: 'bg-gold-soft text-navy-deep hover:bg-white',
  navy: 'bg-navy text-white hover:bg-navy-deep',
  light: 'border border-white/40 text-white hover:bg-white/10',
  dark: 'border border-ink/16 text-ink hover:bg-ink/5'
}

const SIZES = {
  md: 'px-5 py-3.5 text-[12px] font-bold',
  lg: 'px-6 py-4 text-[12px] font-extrabold tracking-[0.067em]'
}

const classes = computed(() => [
  'inline-flex items-center justify-center gap-2 rounded-[2px] transition-colors',
  VARIANTS[props.variant],
  SIZES[props.size]
])

const external = computed(() => !!props.to && /^(https?:|mailto:|tel:)/.test(props.to))
</script>

<template>
  <a v-if="external" :href="to" :target="to!.startsWith('http') ? '_blank' : undefined" :rel="to!.startsWith('http') ? 'noopener' : undefined" :class="classes">
    <slot />
    <UIcon v-if="icon" :name="icon" class="size-3.5" />
  </a>
  <NuxtLink v-else-if="to" :to="to" :class="classes">
    <slot />
    <UIcon v-if="icon" :name="icon" class="size-3.5" />
  </NuxtLink>
  <button v-else type="button" :class="classes">
    <slot />
    <UIcon v-if="icon" :name="icon" class="size-3.5" />
  </button>
</template>
