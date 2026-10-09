<script setup lang="ts">
/** Card with a chart's title; shows `emptyText` instead of the chart when there is nothing to draw. */
defineProps<{
  title: string
  isEmpty: boolean
  emptyText: string
}>()
</script>

<template>
  <BaseCard>
    <h3 class="mb-4 font-semibold text-slate-900 dark:text-white">{{ title }}</h3>
    <p v-if="isEmpty" class="py-10 text-center text-sm text-slate-500 dark:text-slate-400">{{ emptyText }}</p>
    <slot v-else />
  </BaseCard>
</template>
