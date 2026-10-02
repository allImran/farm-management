<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface ChartDataset {
  label: string
  data: number[]
  color?: string
}

const props = withDefaults(
  defineProps<{
    labels: string[]
    datasets: ChartDataset[]
    height?: string
    colors?: string[]
    valuePrefix?: string
    showLegend?: boolean
  }>(),
  {
    height: '18rem',
    colors: () => ['#3b6ef6', '#f5b700', '#22c55e', '#8b6cf2', '#ef4444'],
    valuePrefix: '',
    showLegend: false,
  }
)

const { gridColor, tickColor, tooltipBg } = useChartTheme()

const chartData = computed(() => {
  const isSingleDataset = props.datasets.length === 1

  return {
    labels: props.labels,
    datasets: props.datasets.map((dataset, datasetIndex) => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: isSingleDataset
        ? dataset.data.map((_, i) => dataset.color ?? props.colors[i % props.colors.length])
        : dataset.color ?? props.colors[datasetIndex % props.colors.length],
      borderRadius: 8,
      borderSkipped: false,
      maxBarThickness: 32,
    })),
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      display: props.showLegend,
      position: 'bottom' as const,
      labels: {
        color: tickColor.value,
        usePointStyle: true,
        boxWidth: 8,
        padding: 16,
      },
    },
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
        label: (context: any) => `${props.valuePrefix}${context.formattedValue}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: tickColor.value },
    },
    y: {
      grid: { color: gridColor },
      border: { display: false },
      ticks: { color: tickColor.value },
    },
  },
}))
</script>

<template>
  <div class="relative w-full min-w-0" :style="{ height }">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
