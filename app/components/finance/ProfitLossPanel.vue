<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'
import { CHART_COLORS, EXPENSE_TYPE_COLORS } from '~/constants/charts'
import { EXPENSE_TYPES } from '~/constants/farm'
import { FARM_LEVEL_KEY } from '~/constants/finance'
import type { ToggleItem } from '~/types/finance'
import { isOneOf } from '~/utils/guards'
import type { ProfitLossReport, ProfitLossTotals } from '~/utils/profitLoss'

/**
 * Profit & loss report: totals, expense breakdown and "what if" toggles.
 * Batches (farm page) are toggled in plain sight; expense categories sit behind an
 * "Advanced" disclosure because most users only need the totals.
 */
const props = withDefaults(
  defineProps<{
    report: ProfitLossReport
    actualTotals: ProfitLossTotals | null
    isFiltered: boolean
    /** Batches to toggle and chart (farm page). Farm-level expenses are added as their own item. */
    batches?: Array<{ id: string; name: string }>
    /** Adds the month-by-month chart (dashboard). */
    showMonthly?: boolean
  }>(),
  {
    batches: undefined,
    showMonthly: false,
  },
)

const excludedCategories = defineModel<string[]>('excludedCategories', { required: true })
const excludedBatchKeys = defineModel<string[]>('excludedBatchKeys', { default: () => [] })

const { t } = useI18n()
const { formatMoney } = useLocaleNumber()
const { formatDate } = useLocaleDate()

// Unknown categories (e.g. from older data) are shown like `other`.
const categoryLabel = (category: string) => t(`options.expenseTypes.${isOneOf(EXPENSE_TYPES, category) ? category : 'other'}`)
const categoryColor = (category: string) => (isOneOf(EXPENSE_TYPES, category) ? EXPENSE_TYPE_COLORS[category] : CHART_COLORS.slate)

// Fixed order keeps rows from jumping around while toggling. A category that is left out
// stays listed even when the batch filter hides all its spending, so it can be ticked again.
const categoryItems = computed<ToggleItem[]>(() =>
  [...new Set([...EXPENSE_TYPES, ...Object.keys(props.report.byCategory)])]
    .filter((category) => (props.report.byCategory[category] ?? 0) > 0 || excludedCategories.value.includes(category))
    .map((category) => ({
      key: category,
      label: categoryLabel(category),
      value: formatMoney(props.report.byCategory[category] ?? 0),
      color: categoryColor(category),
    })),
)

const batchItems = computed<ToggleItem[]>(() => {
  if (!props.batches) return []
  const resultOf = (key: string) => props.report.byBatch[key]?.profit ?? 0
  const items = props.batches.map((batch) => ({ key: batch.id, label: batch.name }))
  items.push({ key: FARM_LEVEL_KEY, label: t('reports.farmLevel') })
  return items.map((item) => ({
    ...item,
    value: formatMoney(resultOf(item.key)),
    isNegative: resultOf(item.key) < 0,
  }))
})

const donutSlices = computed(() =>
  categoryItems.value
    .filter((item) => !excludedCategories.value.includes(item.key) && (props.report.byCategory[item.key] ?? 0) > 0)
    .map((item) => ({ label: item.label, value: props.report.byCategory[item.key] ?? 0, color: item.color ?? CHART_COLORS.slate })),
)

/** Sales and expenses side by side, one bar group per labelled row. */
const salesVsExpenses = (rows: { label: string; totals?: Pick<ProfitLossTotals, 'sales' | 'expenses'> }[]) => ({
  labels: rows.map((row) => row.label),
  datasets: [
    { label: t('reports.sales'), color: CHART_COLORS.green, format: formatMoney, data: rows.map((row) => row.totals?.sales ?? 0) },
    { label: t('reports.expenses'), color: CHART_COLORS.red, format: formatMoney, data: rows.map((row) => row.totals?.expenses ?? 0) },
  ],
})

const includedBatches = computed(() => batchItems.value.filter((item) => !excludedBatchKeys.value.includes(item.key)))
const batchChart = computed(() =>
  salesVsExpenses(includedBatches.value.map((item) => ({ label: item.label, totals: props.report.byBatch[item.key] }))),
)
const monthChart = computed(() =>
  salesVsExpenses(
    props.report.byMonth.map((row) => ({ label: formatDate(`${row.month}-01`, { month: 'short', year: 'numeric' }), totals: row })),
  ),
)

const includeAll = () => {
  excludedCategories.value = []
  excludedBatchKeys.value = []
}
</script>

<template>
  <div class="space-y-6">
    <ProfitLossSummary :totals="report.totals" :actual-totals="actualTotals" :is-filtered="isFiltered" @include-all="includeAll" />

    <BaseCard v-if="batches">
      <h3 class="font-semibold text-slate-900 dark:text-white">{{ t('reports.batchFilterTitle') }}</h3>
      <p class="mt-1 mb-4 text-sm text-slate-500 dark:text-slate-400">{{ t('reports.batchFilterHint') }}</p>
      <ProfitLossToggleList v-model:excluded="excludedBatchKeys" :items="batchItems" :label="t('reports.batchFilterTitle')" />
    </BaseCard>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard :title="t('reports.expenseBreakdown')" :is-empty="!donutSlices.length" :empty-text="t('reports.nothingToChart')">
        <DonutChart :data="donutSlices" :format-value="formatMoney" height="14rem" />
      </ChartCard>
      <ChartCard v-if="batches" :title="t('reports.byBatch')" :is-empty="!includedBatches.length" :empty-text="t('reports.nothingToChart')">
        <BarChart :labels="batchChart.labels" :datasets="batchChart.datasets" show-legend />
      </ChartCard>
      <ChartCard v-if="showMonthly" :title="t('reports.byMonth')" :is-empty="!report.byMonth.length" :empty-text="t('reports.nothingToChart')">
        <BarChart :labels="monthChart.labels" :datasets="monthChart.datasets" show-legend />
      </ChartCard>
    </div>

    <details v-if="categoryItems.length" class="group rounded-2xl border border-slate-100 bg-white shadow-soft dark:border-slate-800 dark:bg-surface-dark-elevated">
      <summary
        class="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-6 py-3 outline-none focus-visible:ring-4 focus-visible:ring-primary-300 [&::-webkit-details-marker]:hidden"
      >
        <span class="font-semibold text-slate-900 dark:text-white">{{ t('reports.categoryFilterTitle') }}</span>
        <span class="flex shrink-0 items-center gap-2">
          <BaseBadge v-if="excludedCategories.length" tone="yellow" size="sm">{{ t('reports.leftOut', { count: excludedCategories.length }) }}</BaseBadge>
          <ChevronDown class="h-5 w-5 text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
        </span>
      </summary>
      <div class="px-6 pb-6">
        <p class="mb-4 text-sm text-slate-500 dark:text-slate-400">{{ t('reports.categoryFilterHint') }}</p>
        <ProfitLossToggleList v-model:excluded="excludedCategories" :items="categoryItems" :label="t('reports.categoryFilterTitle')" />
      </div>
    </details>
  </div>
</template>
