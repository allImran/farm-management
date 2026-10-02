<script setup lang="ts">
import { Bird, CalendarDays, HeartPulse, Scale, Skull, TrendingUp, Wallet, Wheat } from '@lucide/vue'
import type { BatchStats } from '~/composables/useBatchStats'

const props = defineProps<{
  stats: BatchStats
}>()

const { t } = useI18n()
const { formatNumber, formatMoney } = useLocaleNumber()

const tiles = computed(() => {
  const s = props.stats
  return [
    { key: 'age', label: t('batches.stats.age'), value: t('batches.ageDays', { days: formatNumber(s.ageDays) }), icon: CalendarDays, tone: 'blue' as const },
    { key: 'alive', label: t('batches.stats.alive'), value: `${formatNumber(s.alive)} / ${formatNumber(s.initialQuantity)}`, icon: Bird, tone: 'yellow' as const },
    {
      key: 'mortality',
      label: t('batches.stats.mortality'),
      value: `${formatNumber(s.mortality)} (${formatNumber(s.mortalityRate, { maximumFractionDigits: 1 })}%)`,
      icon: Skull,
      tone: 'red' as const,
    },
    { key: 'feed', label: t('batches.stats.feed'), value: `${formatNumber(s.feedKg, { maximumFractionDigits: 1 })} ${t('units.kg')}`, icon: Wheat, tone: 'green' as const },
    {
      key: 'weight',
      label: t('batches.stats.weight'),
      value: s.latestWeightGrams === null ? '—' : `${formatNumber(s.latestWeightGrams)} ${t('units.gram')}`,
      icon: Scale,
      tone: 'purple' as const,
    },
    { key: 'fcr', label: t('batches.stats.fcr'), value: s.fcr === null ? '—' : formatNumber(s.fcr, { maximumFractionDigits: 2 }), icon: HeartPulse, tone: 'slate' as const },
    { key: 'expenses', label: t('batches.stats.expenses'), value: formatMoney(s.expenses), icon: Wallet, tone: 'red' as const },
    { key: 'profit', label: t('batches.stats.profit', { sales: formatMoney(s.sales) }), value: formatMoney(s.profit), icon: TrendingUp, tone: s.profit >= 0 ? ('green' as const) : ('red' as const) },
  ]
})
</script>

<template>
  <div class="grid grid-cols-1 min-[400px]:grid-cols-2 xl:grid-cols-4 gap-4">
    <StatCard v-for="tile in tiles" :key="tile.key" :label="tile.label" :value="tile.value" :icon="tile.icon" :tone="tile.tone" />
  </div>
</template>
