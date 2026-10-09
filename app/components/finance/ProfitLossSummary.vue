<script setup lang="ts">
import { TrendingDown, TrendingUp, Wallet, Banknote } from '@lucide/vue'
import type { ProfitLossTotals } from '~/utils/profitLoss'

/** Sales / expenses / profit tiles, plus a notice when "what if" toggles leave items out. */
const props = defineProps<{
  totals: ProfitLossTotals
  /** Result with everything included, shown next to a what-if result. */
  actualTotals: ProfitLossTotals | null
  isFiltered: boolean
}>()

defineEmits<{
  includeAll: []
}>()

const { t } = useI18n()
const { formatMoney } = useLocaleNumber()

// A loss reads better as "Loss ৳5,000" than "Profit ৳-5,000".
const resultLabel = (profit: number) => t(profit < 0 ? 'reports.loss' : 'reports.profit')
const isLoss = computed(() => props.totals.profit < 0)
const actualResult = computed(() =>
  props.actualTotals ? `${resultLabel(props.actualTotals.profit)} ${formatMoney(Math.abs(props.actualTotals.profit))}` : '',
)
</script>

<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard :label="t('reports.sales')" :value="formatMoney(totals.sales)" :icon="Banknote" tone="green" />
      <StatCard :label="t('reports.expenses')" :value="formatMoney(totals.expenses)" :icon="Wallet" tone="red" />
      <StatCard
        :label="resultLabel(totals.profit)"
        :value="formatMoney(Math.abs(totals.profit))"
        :icon="isLoss ? TrendingDown : TrendingUp"
        :tone="isLoss ? 'red' : 'green'"
      />
    </div>
    <BaseAlert v-if="isFiltered" variant="warning">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <span>{{ t('reports.whatIf', { amount: actualResult }) }}</span>
        <BaseButton variant="outline" @click="$emit('includeAll')">{{ t('reports.includeAll') }}</BaseButton>
      </div>
    </BaseAlert>
  </div>
</template>
