<script setup lang="ts">
import { CHART_COLORS } from '~/constants/charts'
import type { BatchSeries } from '~/utils/batchSeries'

/** Growth, mortality and feed over the batch's life, one point per day of age. */
const props = defineProps<{
  series: BatchSeries
  hasWeights: boolean
  hasDeaths: boolean
  hasFeed: boolean
}>()

const { t } = useI18n()
const { formatNumber } = useLocaleNumber()

const labels = computed(() => props.series.days.map((day) => t('charts.day', { day: formatNumber(day) })))

const formatGrams = (value: number) => `${formatNumber(value, { maximumFractionDigits: 0 })} ${t('units.gram')}`
const formatBirds = (value: number) => formatNumber(value, { maximumFractionDigits: 0 })
const formatPercent = (value: number) => `${formatNumber(value, { maximumFractionDigits: 2 })}%`
const formatKg = (value: number) => `${formatNumber(value, { maximumFractionDigits: 1 })} ${t('units.kg')}`

const growthDatasets = computed(() => [
  { label: t('charts.growth'), data: props.series.weightGrams, color: CHART_COLORS.purple, format: formatGrams },
])

const mortalityDatasets = computed(() => [
  { label: t('charts.dailyDeaths'), data: props.series.deaths, color: CHART_COLORS.red, format: formatBirds },
  {
    label: t('charts.cumulativeMortality'),
    data: props.series.cumulativeMortalityPct,
    color: CHART_COLORS.slate,
    type: 'line' as const,
    axis: 'right' as const,
    format: formatPercent,
  },
])

const feedDatasets = computed(() => [
  { label: t('charts.dailyFeed'), data: props.series.feedKg, color: CHART_COLORS.green, format: formatKg },
  {
    label: t('charts.cumulativeFeed'),
    data: props.series.cumulativeFeedKg,
    color: CHART_COLORS.blue,
    type: 'line' as const,
    axis: 'right' as const,
    format: formatKg,
  },
])
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <BaseCard class="lg:col-span-2">
      <h3 class="mb-4 font-semibold text-slate-900 dark:text-white">{{ t('charts.growth') }}</h3>
      <LineChart v-if="hasWeights" :labels="labels" :datasets="growthDatasets" filled height="16rem" />
      <p v-else class="py-10 text-center text-sm text-slate-500 dark:text-slate-400">{{ t('charts.noWeights') }}</p>
    </BaseCard>
    <BaseCard>
      <h3 class="mb-4 font-semibold text-slate-900 dark:text-white">{{ t('charts.mortality') }}</h3>
      <BarChart v-if="hasDeaths" :labels="labels" :datasets="mortalityDatasets" show-legend height="16rem" />
      <p v-else class="py-10 text-center text-sm text-slate-500 dark:text-slate-400">{{ t('charts.noMortality') }}</p>
    </BaseCard>
    <BaseCard>
      <h3 class="mb-4 font-semibold text-slate-900 dark:text-white">{{ t('charts.feed') }}</h3>
      <BarChart v-if="hasFeed" :labels="labels" :datasets="feedDatasets" show-legend height="16rem" />
      <p v-else class="py-10 text-center text-sm text-slate-500 dark:text-slate-400">{{ t('charts.noFeed') }}</p>
    </BaseCard>
  </div>
</template>
