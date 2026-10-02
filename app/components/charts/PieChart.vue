<script setup lang="ts">
import { Pie } from 'vue-chartjs'
import { Chart, ArcElement, Tooltip } from 'chart.js'

Chart.register(ArcElement, Tooltip)

interface PieSlice {
  label: string
  value: number
  color: string
}

const props = withDefaults(
  defineProps<{
    data: PieSlice[]
    height?: string
  }>(),
  {
    height: '18rem',
  }
)

const { tooltipBg } = useChartTheme()

const chartData = computed(() => ({
  labels: props.data.map((slice) => slice.label),
  datasets: [
    {
      data: props.data.map((slice) => slice.value),
      backgroundColor: props.data.map((slice) => slice.color),
      borderWidth: 2,
      borderColor: 'transparent',
      hoverOffset: 6,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
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
    },
  },
}))
</script>

<template>
  <div class="w-full min-w-0">
    <div class="relative w-full min-w-0" :style="{ height }">
      <Pie :data="chartData" :options="chartOptions" />
    </div>
    <div class="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-5">
      <div v-for="slice in data" :key="slice.label" class="flex items-center gap-2 text-sm">
        <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: slice.color }" />
        <span class="text-slate-500 dark:text-slate-400">{{ slice.label }}:</span>
        <span class="font-semibold text-slate-800 dark:text-slate-100">{{ slice.value.toLocaleString() }}</span>
      </div>
    </div>
  </div>
</template>
