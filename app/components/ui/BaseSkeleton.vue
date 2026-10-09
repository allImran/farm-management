<script setup lang="ts">
/** Shimmering placeholder block shown while content loads. */
withDefaults(
  defineProps<{
    height?: string
  }>(),
  {
    height: '6rem',
  }
)
</script>

<template>
  <span
    class="block w-full rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-800 dark:to-slate-700 bg-[length:1000px_100%] animate-shimmer"
    :style="{ height }"
  />
</template>
