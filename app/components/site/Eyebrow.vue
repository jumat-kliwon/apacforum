<script setup lang="ts">
/** All-caps label that opens almost every section of the public site. */
defineProps<{ dark?: boolean }>()
</script>

<template>
  <p class="text-[12px]/[18px] font-extrabold tracking-[0.14em]" :class="dark ? 'text-gold-soft' : 'text-navy'">
    <slot />
  </p>
</template>
