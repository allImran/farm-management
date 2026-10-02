<script setup lang="ts">
import type { Component } from 'vue'

export interface ActivityItem {
  id: string | number
  icon: Component
  title: string
  timestamp: string
  tone?: 'yellow' | 'blue' | 'green' | 'purple' | 'red' | 'slate'
}

defineProps<{
  items: ActivityItem[]
}>()

const dotTone: Record<string, string> = {
  yellow: 'bg-primary-500',
  blue: 'bg-accent-blue',
  green: 'bg-accent-green',
  purple: 'bg-accent-purple',
  red: 'bg-accent-red',
  slate: 'bg-slate-400',
}
</script>

<template>
  <ul class="space-y-5">
    <li v-for="(item, idx) in items" :key="item.id" class="flex gap-3 relative">
      <div class="flex flex-col items-center">
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 z-10"
          :class="dotTone[item.tone ?? 'slate']"
        >
          <component :is="item.icon" class="w-4 h-4" />
        </div>
        <div v-if="idx < items.length - 1" class="w-px flex-1 bg-slate-200 dark:bg-slate-700 mt-1" />
      </div>
      <div class="pb-1 min-w-0">
        <p class="text-sm text-slate-800 dark:text-slate-200">{{ item.title }}</p>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{{ item.timestamp }}</p>
      </div>
    </li>
  </ul>
</template>
