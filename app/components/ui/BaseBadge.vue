<script setup lang="ts">
import { ArrowUp, ArrowDown } from '@lucide/vue'

type Tone = 'yellow' | 'blue' | 'green' | 'purple' | 'red' | 'slate'

const props = withDefaults(
  defineProps<{
    tone?: Tone
    trend?: 'up' | 'down' | null
    size?: 'sm' | 'md'
  }>(),
  {
    tone: 'slate',
    trend: null,
    size: 'md',
  }
)

const toneClasses: Record<Tone, string> = {
  yellow: 'bg-primary-100 text-primary-800 dark:bg-primary-500/15 dark:text-primary-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300',
}
</script>

<template>
  <span
    class="inline-flex items-center font-semibold rounded-full"
    :class="[
      toneClasses[tone],
      size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-0.5' : 'text-xs px-2.5 py-1 gap-1',
    ]"
  >
    <ArrowUp v-if="trend === 'up'" class="w-3 h-3" />
    <ArrowDown v-else-if="trend === 'down'" class="w-3 h-3" />
    <slot />
  </span>
</template>
