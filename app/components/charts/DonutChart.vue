<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import { ArcElement, Chart, Tooltip } from 'chart.js'

Chart.register(ArcElement, Tooltip)

interface DonutSlice {
  label: string
  value: number
  color: string
}

/** Doughnut with the total in the middle and a legend listing every slice's value. */
const props = withDefaults(
  defineProps<{
    data: DonutSlice[]
    height?: string
    /** Formats slice values in the legend, tooltip and center total (e.g. money). */
    formatValue?: (value: number) => string
  }>(),
  {
    height: '18rem',
    formatValue: (value: number) => value.toLocaleString(),
  }
)

const { tooltip } = useChartTheme()

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
  cutout: '72%',
  plugins: {
    legend: { display: false },
    tooltip: tooltip((context: { label: string; parsed: number }) => `${context.label}: ${props.formatValue(context.parsed)}`),
  },
}))

const total = computed(() => props.data.reduce((sum, slice) => sum + slice.value, 0))
</script>

<template>
  <div class="w-full min-w-0">
    <div class="relative w-full min-w-0" :style="{ height }">
      <Doughnut :data="chartData" :options="chartOptions" />
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span class="text-2xl font-bold text-slate-800 dark:text-slate-100">{{ formatValue(total) }}</span>
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
