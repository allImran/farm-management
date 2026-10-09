<script setup lang="ts" generic="T extends object">
/**
 * Data table that scrolls sideways inside its card on small screens. Cells show `row[column.key]`
 * unless a `cell-<key>` slot renders them. Empty and loading states belong to `BaseAsyncState`.
 */
defineProps<{
  columns: { key: string; label: string }[]
  rows: T[]
  /** Row field holding a stable unique id. */
  rowKey: keyof T
}>()

defineSlots<Record<`cell-${string}`, (props: { row: T }) => unknown>>()
</script>

<template>
  <div class="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark-elevated shadow-soft overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 dark:bg-slate-800/40">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <tr
            v-for="row in rows"
            :key="String(row[rowKey])"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <td v-for="column in columns" :key="column.key" class="px-4 py-3.5 text-slate-700 dark:text-slate-200">
              <slot :name="`cell-${column.key}`" :row="row">
                {{ row[column.key as keyof T] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
