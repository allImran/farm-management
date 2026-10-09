<script setup lang="ts">
import { ChartPie } from '@lucide/vue'
import type { FinanceScope } from '~/services/records.service'

/**
 * Profit & loss section with its loading / error / empty states. Loads its own records;
 * call the exposed `reload()` after expenses or sales change.
 */
const props = withDefaults(
  defineProps<{
    /** `undefined` while the scope isn't known yet (e.g. the batch is still loading). */
    scope: FinanceScope | undefined
    description: string
    /** Batches to toggle and chart (farm page). */
    batches?: Array<{ id: string; name: string }>
    showMonthly?: boolean
  }>(),
  {
    batches: undefined,
    showMonthly: false,
  },
)

const { t } = useI18n()
const { status, error, reload, excludedCategories, excludedBatchKeys, report, actualTotals, isFiltered, hasData } = useProfitLoss(
  () => props.scope,
)

defineExpose({ reload })
</script>

<template>
  <section>
    <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('reports.title') }}</h2>
    <p class="mt-1 mb-4 text-sm text-slate-500 dark:text-slate-400">{{ description }}</p>
    <BaseAsyncState
      :status="status"
      :error="error"
      :is-empty="!hasData"
      :empty-title="t('reports.emptyTitle')"
      :empty-description="t('reports.emptyDescription')"
      @retry="reload"
    >
      <template #loading><StatCardsSkeleton /></template>
      <template #empty-icon><ChartPie class="w-7 h-7" /></template>
      <ProfitLossPanel
        v-if="report"
        v-model:excluded-categories="excludedCategories"
        v-model:excluded-batch-keys="excludedBatchKeys"
        :report="report"
        :actual-totals="actualTotals"
        :is-filtered="isFiltered"
        :batches="batches"
        :show-monthly="showMonthly"
      />
    </BaseAsyncState>
  </section>
</template>
