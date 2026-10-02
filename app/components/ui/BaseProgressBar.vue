<script setup lang="ts">
import { computed } from 'vue'

type Tone = 'yellow' | 'blue' | 'green' | 'purple' | 'red' | 'slate'

const props = withDefaults(
  defineProps<{
    value?: number
    tone?: Tone
    showLabel?: boolean
  }>(),
  {
    value: 0,
    tone: 'yellow',
    showLabel: false,
  }
)

const toneClasses: Record<Tone, string> = {
  yellow: 'bg-primary-500',
  blue: 'bg-accent-blue',
  green: 'bg-accent-green',
  purple: 'bg-accent-purple',
  red: 'bg-accent-red',
  slate: 'bg-slate-500',
}

const clampedValue = computed(() => Math.min(100, Math.max(0, props.value)))
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-1.5" v-if="showLabel">
      <span class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ Math.round(clampedValue) }}%</span>
    </div>
    <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-surface-dark-elevated overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-300 ease-out"
        :class="toneClasses[tone]"
        :style="{ width: clampedValue + '%' }"
      />
    </div>
  </div>
</template>
