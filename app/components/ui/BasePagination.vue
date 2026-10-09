<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'

/** Numbered page buttons for admin tables; renders nothing when there is only one page. */
const props = defineProps<{
  totalPages: number
}>()

const currentPage = defineModel<number>('currentPage', { required: true })

// Up to 7 pages are listed in full; beyond that: first, last, the current page ± 1 and "…" gaps.
const pages = computed<(number | '...')[]>(() => {
  const total = props.totalPages
  const current = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const result: (number | '...')[] = [1]
  if (current > 3) result.push('...')
  for (let page = Math.max(2, current - 1); page <= Math.min(total - 1, current + 1); page++) result.push(page)
  if (current < total - 2) result.push('...')
  result.push(total)
  return result
})

const goTo = (page: number) => {
  if (page < 1 || page > props.totalPages || page === currentPage.value) return
  currentPage.value = page
}

const arrowClass =
  'flex items-center justify-center w-10 h-10 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-dark-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
</script>

<template>
  <nav v-if="totalPages > 1" :aria-label="$t('common.pagination')" class="mt-4 flex items-center justify-center gap-1">
    <button type="button" :class="arrowClass" :disabled="currentPage <= 1" :aria-label="$t('common.previous')" @click="goTo(currentPage - 1)">
      <ChevronLeft class="w-4 h-4" />
    </button>

    <template v-for="(page, index) in pages" :key="index">
      <span v-if="page === '...'" class="flex items-center justify-center w-10 h-10 text-sm text-slate-400 dark:text-slate-500">&hellip;</span>
      <button
        v-else
        type="button"
        class="flex items-center justify-center w-10 h-10 rounded-lg text-sm font-semibold transition-colors"
        :class="
          page === currentPage
            ? 'bg-primary-500 text-slate-900 shadow-soft'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-dark-elevated'
        "
        :aria-current="page === currentPage ? 'page' : undefined"
        @click="goTo(page)"
      >
        {{ page }}
      </button>
    </template>

    <button type="button" :class="arrowClass" :disabled="currentPage >= totalPages" :aria-label="$t('common.next')" @click="goTo(currentPage + 1)">
      <ChevronRight class="w-4 h-4" />
    </button>
  </nav>
</template>
