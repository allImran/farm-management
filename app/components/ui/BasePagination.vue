<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    currentPage: number
    totalPages: number
  }>(),
  {}
)

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

const pages = computed<(number | '...')[]>(() => {
  const total = props.totalPages
  const current = props.currentPage
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const result: (number | '...')[] = [1]

  if (current > 3) result.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) result.push(i)

  if (current < total - 2) result.push('...')

  result.push(total)
  return result
})

function goTo(page: number) {
  if (page < 1 || page > props.totalPages || page === props.currentPage) return
  emit('update:currentPage', page)
}
</script>

<template>
  <nav class="flex items-center gap-1">
    <button
      type="button"
      class="flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-dark-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      :disabled="currentPage <= 1"
      @click="goTo(currentPage - 1)"
    >
      <ChevronLeft class="w-4 h-4" />
    </button>

    <template v-for="(page, index) in pages" :key="index">
      <span
        v-if="page === '...'"
        class="flex items-center justify-center w-9 h-9 text-sm text-slate-400 dark:text-slate-500"
      >
        &hellip;
      </span>
      <button
        v-else
        type="button"
        class="flex items-center justify-center w-9 h-9 rounded-lg text-sm font-semibold transition-colors"
        :class="
          page === currentPage
            ? 'bg-primary-500 text-slate-900 shadow-soft'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-dark-elevated'
        "
        @click="goTo(page)"
      >
        {{ page }}
      </button>
    </template>

    <button
      type="button"
      class="flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-dark-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      :disabled="currentPage >= totalPages"
      @click="goTo(currentPage + 1)"
    >
      <ChevronRight class="w-4 h-4" />
    </button>
  </nav>
</template>
