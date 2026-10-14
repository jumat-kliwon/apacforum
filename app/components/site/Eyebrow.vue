<script setup lang="ts">
/** Gold rule + all-caps label that opens almost every section of the public site. */
defineProps<{ dark?: boolean }>()
</script>

<template>
  <p class="flex items-center gap-2.5 text-[12px]/[18px] font-extrabold tracking-[0.14em]" :class="dark ? 'text-gold-soft' : 'text-navy'">
    <span class="h-0.5 w-[26px] shrink-0 bg-gold" />
    <slot />
  </p>
</template>
