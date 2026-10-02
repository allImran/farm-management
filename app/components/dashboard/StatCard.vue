<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(
  defineProps<{
    label: string
    value: string | number
    icon?: Component
    trend?: 'up' | 'down' | null
    trendValue?: string
    tone?: 'yellow' | 'blue' | 'green' | 'purple' | 'red' | 'slate'
  }>(),
  {
    trend: null,
    tone: 'slate',
  }
)

const iconBg: Record<string, string> = {
  yellow: 'bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300',
}
</script>

<template>
  <BaseCard>
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">{{ label }}</p>
        <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">{{ value }}</p>
      </div>
      <div v-if="icon" class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" :class="iconBg[tone]">
        <component :is="icon" class="w-5 h-5" />
      </div>
    </div>
    <div v-if="trend" class="mt-3">
      <BaseBadge :tone="trend === 'up' ? 'green' : 'blue'" :trend="trend" size="sm">
        {{ trendValue }}
      </BaseBadge>
    </div>
  </BaseCard>
</template>
