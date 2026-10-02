<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
  }>(),
  {}
)
</script>

<template>
  <div class="flex items-center justify-between gap-4 flex-wrap mb-5">
    <div>
      <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ title }}</h2>
      <p v-if="description" class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
