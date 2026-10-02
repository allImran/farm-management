<script setup lang="ts">
import { ArrowUpDown } from '@lucide/vue'

type Column = { key: string; label: string; sortable?: boolean }

withDefaults(
  defineProps<{
    columns: Column[]
    rows?: Record<string, unknown>[]
    loading?: boolean
    stickyHeader?: boolean
  }>(),
  {
    rows: () => [],
    loading: false,
    stickyHeader: false,
  }
)

const emit = defineEmits<{
  sort: [key: string]
}>()
</script>

<template>
  <div class="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark-elevated shadow-soft overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead
          class="bg-slate-50 dark:bg-slate-800/40"
          :class="stickyHeader ? 'sticky top-0 z-10' : ''"
        >
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <button
                v-if="column.sortable"
                type="button"
                class="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                @click="emit('sort', column.key)"
              >
                {{ column.label }}
                <ArrowUpDown class="w-3 h-3" />
              </button>
              <span v-else>{{ column.label }}</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <template v-if="loading">
            <tr v-for="i in 5" :key="'skeleton-' + i">
              <td v-for="column in columns" :key="column.key" class="px-4 py-3.5">
                <span class="block h-4 w-full max-w-[10rem] rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-800 dark:to-slate-700 bg-[length:1000px_100%] animate-shimmer" />
              </td>
            </tr>
          </template>
          <template v-else-if="rows.length">
            <tr
              v-for="(row, index) in rows"
              :key="index"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <td v-for="column in columns" :key="column.key" class="px-4 py-3.5 text-slate-700 dark:text-slate-200">
                <slot :name="`cell-${column.key}`" :row="row">
                  {{ row[column.key] }}
                </slot>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td :colspan="columns.length" class="px-4 py-10 text-center text-slate-400 dark:text-slate-500">
              <slot name="empty">No data available</slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
