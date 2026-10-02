<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(
  defineProps<{
    icon: Component
    title: string
    description: string
    priority?: 'high' | 'medium' | 'low'
    actionLabel?: string
    actionVariant?: 'primary' | 'secondary' | 'outline' | 'dark'
  }>(),
  {
    priority: 'medium',
    actionLabel: 'View',
    actionVariant: 'outline',
  }
)

defineEmits<{
  action: []
}>()

const priorityTone: Record<string, 'red' | 'yellow' | 'blue'> = {
  high: 'red',
  medium: 'yellow',
  low: 'blue',
}
</script>

<template>
  <div
    class="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
  >
    <div class="flex items-center gap-3 min-w-0">
      <div
        class="w-10 h-10 rounded-lg bg-white dark:bg-surface-dark-elevated shadow-soft flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-300"
      >
        <component :is="icon" class="w-4 h-4" />
      </div>
      <div class="min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <p class="font-semibold text-slate-900 dark:text-white text-sm">{{ title }}</p>
          <BaseBadge :tone="priorityTone[priority]" size="sm">{{ priority.toUpperCase() }}</BaseBadge>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{{ description }}</p>
      </div>
    </div>
    <BaseButton :variant="actionVariant" size="sm" class="shrink-0" @click="$emit('action')">
      {{ actionLabel }}
    </BaseButton>
  </div>
</template>
