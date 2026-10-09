<script setup lang="ts" generic="T extends string">
import type { Tab } from '~/types/ui'

/** Pill-style tab bar. On narrow screens it scrolls sideways instead of wrapping. */
defineProps<{
  tabs: Tab<T>[]
}>()

const selected = defineModel<T>({ required: true })
</script>

<template>
  <div class="-mx-4 px-4 overflow-x-auto scrollbar-none">
    <div class="inline-flex items-center gap-1 p-1 rounded-full bg-slate-100 dark:bg-surface-dark-elevated whitespace-nowrap">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="px-4 py-2 text-sm font-semibold rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
        :class="
          selected === tab.value
            ? 'bg-slate-900 text-white dark:bg-primary-500 dark:text-slate-900 shadow-soft'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        "
        :aria-pressed="selected === tab.value"
        @click="selected = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>
