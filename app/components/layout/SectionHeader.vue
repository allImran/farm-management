<script setup lang="ts">
/**
 * Heading row for a section inside a page: title, optional description and action buttons.
 * Actions stay on the title's row at every width; a long title wraps instead of pushing them down.
 */
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="flex justify-between gap-3 mb-4" :class="description ? 'items-start' : 'items-center'">
    <div class="flex-1 min-w-0">
      <h2 class="text-lg font-bold text-slate-900 dark:text-white break-words">{{ title }}</h2>
      <p v-if="description" class="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="shrink-0 flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
