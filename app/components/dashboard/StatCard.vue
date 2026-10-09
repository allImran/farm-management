<script setup lang="ts">
import type { Component } from 'vue'
import type { Tone } from '~/types/ui'

/** A labelled headline number with an optional icon. */
withDefaults(
  defineProps<{
    label: string
    value: string | number
    icon?: Component
    tone?: Tone
  }>(),
  {
    icon: undefined,
    tone: 'slate',
  }
)
</script>

<template>
  <BaseCard :padded="false" class="p-4 sm:p-6">
    <!-- Mobile: icon stacked above the number so two cards fit side by side; sm+: icon on the right. -->
    <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0">
        <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">{{ label }}</p>
        <p class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 break-words">{{ value }}</p>
      </div>
      <BaseIconTile v-if="icon" :icon="icon" :tone="tone" />
    </div>
  </BaseCard>
</template>
