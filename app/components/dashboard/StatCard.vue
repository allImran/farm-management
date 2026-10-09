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
  <BaseCard>
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">{{ label }}</p>
        <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">{{ value }}</p>
      </div>
      <BaseIconTile v-if="icon" :icon="icon" :tone="tone" />
    </div>
  </BaseCard>
</template>
