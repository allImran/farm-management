<script setup lang="ts">
import { Inbox } from '@lucide/vue'

withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: 'No data yet',
  }
)
</script>

<template>
  <div class="flex flex-col items-center justify-center text-center py-14 px-6">
    <div
      class="flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 dark:bg-surface-dark-elevated text-slate-400 dark:text-slate-500 mb-4"
    >
      <slot name="icon">
        <Inbox class="w-7 h-7" />
      </slot>
    </div>
    <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-100">
      {{ title }}
    </h3>
    <p v-if="description" class="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
      {{ description }}
    </p>
    <div v-if="$slots.action" class="mt-5">
      <slot name="action" />
    </div>
  </div>
</template>
