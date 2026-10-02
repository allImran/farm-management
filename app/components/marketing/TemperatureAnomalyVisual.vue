<script setup lang="ts">
// Hourly average body temperature (°C) for one shed over 24 h; the evening rise is the anomaly.
const READINGS = [
  40.9, 40.8, 40.8, 40.7, 40.7, 40.8, 40.9, 41.0, 41.1, 41.1, 41.2, 41.2, 41.1, 41.2, 41.1, 41.0, 41.1,
  41.3, 41.7, 42.2, 42.4, 42.1, 41.6, 41.3, 41.1,
]
const ANOMALY_START = 17
const NORMAL_MIN = 40.5
const NORMAL_MAX = 41.5
const SCALE_MIN = 39.8
const SCALE_MAX = 42.8
const HOUR_TICKS = [0, 6, 12, 18, 24]

// The SVG uses a 100×100 box stretched to the container, so HTML overlays can share % coordinates.
const toX = (index: number) => (index / (READINGS.length - 1)) * 100
const toY = (temperature: number) => 100 - ((temperature - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100

const toPoints = (from: number, to: number) =>
  READINGS.slice(from, to + 1)
    .map((value, offset) => `${toX(from + offset)},${toY(value)}`)
    .join(' ')

const normalLine = toPoints(0, ANOMALY_START)
const anomalyLine = toPoints(ANOMALY_START, READINGS.length - 1)
const areaPath = `M0,100 L${toPoints(0, READINGS.length - 1).replaceAll(' ', ' L')} L100,100 Z`

const peakValue = Math.max(...READINGS)
const peakIndex = READINGS.indexOf(peakValue)
const peakStyle = { left: `${toX(peakIndex)}%`, top: `${toY(peakValue)}%` }

const { t } = useI18n()
const { formatNumber } = useLocaleNumber()

const formatTemperature = (value: number) =>
  `${formatNumber(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}°C`
const formatHour = (hour: number) =>
  `${formatNumber(hour, { minimumIntegerDigits: 2 })}:${formatNumber(0, { minimumIntegerDigits: 2 })}`
</script>

<template>
  <figure
    role="img"
    :aria-label="t('poultry.visual.label')"
    class="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-card sm:p-7 dark:border-slate-800 dark:bg-surface-dark-elevated"
  >
    <div class="flex flex-wrap items-center justify-between gap-3" aria-hidden="true">
      <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ t('poultry.visual.title') }}</p>
      <p class="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span class="h-2.5 w-2.5 rounded-sm bg-accent-green/30" />
        {{ t('poultry.visual.normalRange') }} {{ formatNumber(NORMAL_MIN) }}–{{ formatTemperature(NORMAL_MAX) }}
      </p>
    </div>

    <div class="relative mt-6 h-44 sm:h-56" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="absolute inset-0 h-full w-full overflow-visible">
        <rect x="0" :y="toY(NORMAL_MAX)" width="100" :height="toY(NORMAL_MIN) - toY(NORMAL_MAX)" class="fill-accent-green/10" />
        <path :d="areaPath" class="fill-accent-blue/10" />
        <polyline
          :points="normalLine"
          fill="none"
          vector-effect="non-scaling-stroke"
          class="stroke-accent-blue"
          stroke-width="2.5"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
        <polyline
          :points="anomalyLine"
          fill="none"
          vector-effect="non-scaling-stroke"
          class="stroke-accent-red"
          stroke-width="2.5"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
      </svg>

      <span class="absolute -translate-x-1/2 -translate-y-1/2" :style="peakStyle">
        <span class="absolute inset-0 rounded-full bg-accent-red/40 animate-ping motion-reduce:hidden" />
        <span class="relative block h-3.5 w-3.5 rounded-full border-2 border-white bg-accent-red dark:border-surface-dark-elevated" />
      </span>

      <div
        class="absolute -translate-x-full -translate-y-1/2 pr-4"
        :style="peakStyle"
      >
        <div class="whitespace-nowrap rounded-xl border border-red-200 bg-red-50 px-3 py-2 shadow-popover dark:border-red-500/30 dark:bg-red-950/80">
          <p class="text-xs font-bold text-red-700 dark:text-red-300">
            {{ t('poultry.visual.anomaly') }} · {{ formatTemperature(peakValue) }}
          </p>
          <p class="text-xs text-red-600/80 dark:text-red-300/80">{{ t('poultry.visual.anomalyDetail') }}</p>
        </div>
      </div>
    </div>

    <div class="mt-3 flex justify-between text-xs text-slate-400 dark:text-slate-500" aria-hidden="true">
      <span v-for="hour in HOUR_TICKS" :key="hour">{{ formatHour(hour) }}</span>
    </div>
  </figure>
</template>
