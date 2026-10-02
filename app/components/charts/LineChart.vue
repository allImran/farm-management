<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

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
    filled?: boolean
    valuePrefix?: string
    showLegend?: boolean
  }>(),
  {
    height: '18rem',
    colors: () => ['#3b6ef6', '#f5b700', '#22c55e', '#8b6cf2', '#ef4444'],
    filled: false,
    valuePrefix: '',
    showLegend: false,
  }
)

const { gridColor, tickColor, tooltipBg } = useChartTheme()

const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const makeGradient = (ctx: CanvasRenderingContext2D, area: any, color: string) => {
  const gradient = ctx.createLinearGradient(0, area.top, 0, area.bottom)
  gradient.addColorStop(0, hexToRgba(color, 0.35))
  gradient.addColorStop(1, hexToRgba(color, 0))
  return gradient
}

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map((dataset, i) => {
    const color = dataset.color ?? props.colors[i % props.colors.length]
    return {
      label: dataset.label,
      data: dataset.data,
      borderColor: color,
      backgroundColor: props.filled
        ? (context: any) => {
            const { ctx, chartArea } = context.chart
            if (!chartArea) return hexToRgba(color, 0.2)
            return makeGradient(ctx, chartArea, color)
          }
        : color,
      fill: props.filled,
      tension: 0.4,
      borderWidth: 2.5,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: color,
      pointHoverBorderColor: '#ffffff',
      pointHoverBorderWidth: 2,
      pointBackgroundColor: color,
    }
  }),
}))

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
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
