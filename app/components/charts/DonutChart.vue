<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import { Chart, ArcElement, Tooltip } from 'chart.js'

Chart.register(ArcElement, Tooltip)

interface DonutSlice {
  label: string
  value: number
  color: string
}

const props = withDefaults(
  defineProps<{
    data: DonutSlice[]
    height?: string
    centerText?: string
    centerLabel?: string
    cutout?: string
    /** Formats slice values in the legend, tooltip and center total (e.g. money). */
    formatValue?: (value: number) => string
  }>(),
  {
    height: '18rem',
    centerText: '',
    centerLabel: '',
    cutout: '72%',
    formatValue: (value: number) => value.toLocaleString(),
  }
)

const { tooltipBg } = useChartTheme()

const chartData = computed(() => ({
  labels: props.data.map((slice) => slice.label),
  datasets: [
    {
      data: props.data.map((slice) => slice.value),
      backgroundColor: props.data.map((slice) => slice.color),
      borderWidth: 0,
      hoverOffset: 6,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: props.cutout,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: tooltipBg,
      padding: 12,
      cornerRadius: 12,
      displayColors: false,
      titleColor: '#e2e8f0',
      titleFont: { weight: 'normal' as const, size: 11 },
      bodyColor: '#ffffff',
      bodyFont: { weight: 'bold' as const, size: 14 },
      callbacks: {
        label: (context: { label: string; parsed: number }) => `${context.label}: ${props.formatValue(context.parsed)}`,
      },
    },
  },
}))

const total = computed(() => props.data.reduce((sum, slice) => sum + slice.value, 0))
</script>

<template>
  <div class="w-full min-w-0">
    <div class="relative w-full min-w-0" :style="{ height }">
      <Doughnut :data="chartData" :options="chartOptions" />
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <slot name="center">
          <span class="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {{ centerText || formatValue(total) }}
          </span>
          <span v-if="centerLabel" class="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {{ centerLabel }}
          </span>
        </slot>
      </div>
    </div>
    <div class="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-5">
      <div v-for="slice in data" :key="slice.label" class="flex items-center gap-2 text-sm">
        <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: slice.color }" />
        <span class="text-slate-500 dark:text-slate-400">{{ slice.label }}:</span>
        <span class="font-semibold text-slate-800 dark:text-slate-100">{{ formatValue(slice.value) }}</span>
      </div>
    </div>
  </div>
</template>
