<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  type ChartData,
  type TooltipItem,
} from 'chart.js'

// Line parts are registered so a dataset can be drawn as a line over the bars.
Chart.register(CategoryScale, LinearScale, BarElement, LineController, LineElement, PointElement, Tooltip, Legend)

interface ChartDataset {
  label: string
  data: number[]
  color?: string
  /** Draw this dataset as a line over the bars (e.g. a running total). */
  type?: 'bar' | 'line'
  /** `right` plots it on a second y-axis with its own scale. */
  axis?: 'left' | 'right'
  /** Formats this dataset's values in the tooltip (and on its axis). */
  format?: (value: number) => string
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

const colorAt = (index: number) => props.colors[index % props.colors.length] ?? '#3b6ef6'
const hasRightAxis = computed(() => props.datasets.some((dataset) => dataset.axis === 'right'))
const formatterFor = (axis: 'left' | 'right') => props.datasets.find((dataset) => (dataset.axis ?? 'left') === axis)?.format

const chartData = computed<ChartData<'bar' | 'line', number[]>>(() => {
  const isSingleDataset = props.datasets.length === 1

  return {
    labels: props.labels,
    datasets: props.datasets.map((dataset, datasetIndex) => {
      const yAxisID = dataset.axis === 'right' ? 'y1' : 'y'
      if (dataset.type === 'line') {
        const color = dataset.color ?? colorAt(datasetIndex)
        return {
          type: 'line' as const,
          label: dataset.label,
          data: dataset.data,
          yAxisID,
          borderColor: color,
          backgroundColor: color,
          borderWidth: 2.5,
          // Monotone smoothing never overshoots, so a running total never appears to dip.
          cubicInterpolationMode: 'monotone' as const,
          pointRadius: 0,
          pointHoverRadius: 5,
          // Lines sit above the bars.
          order: 0,
        }
      }
      return {
        type: 'bar' as const,
        label: dataset.label,
        data: dataset.data,
        yAxisID,
        backgroundColor: isSingleDataset
          ? dataset.data.map((_, i) => dataset.color ?? colorAt(i))
          : dataset.color ?? colorAt(datasetIndex),
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 32,
        order: 1,
      }
    }),
  }
})

// Chart.js draws line datasets inside a bar chart (a "mixed chart"), but vue-chartjs types
// <Bar> as bar-only, so the mixed data is cast at this one boundary.
const barData = computed(() => chartData.value as unknown as ChartData<'bar'>)

const tooltipLabel = (context: TooltipItem<'bar'>) => {
  const dataset = props.datasets[context.datasetIndex]
  const value = typeof context.parsed.y === 'number' ? context.parsed.y : 0
  const formatted = dataset?.format ? dataset.format(value) : `${props.valuePrefix}${context.formattedValue}`
  // With several datasets the tooltip lists them all, so each value needs its name.
  return props.datasets.length > 1 ? `${dataset?.label ?? ''}: ${formatted}` : formatted
}

const axisTicks = (axis: 'left' | 'right') => {
  const format = formatterFor(axis)
  return {
    color: tickColor.value,
    ...(format ? { callback: (value: string | number) => format(Number(value)) } : {}),
  }
}

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
      displayColors: props.datasets.length > 1,
      titleColor: '#e2e8f0',
      titleFont: { weight: 'normal' as const, size: 11 },
      bodyColor: '#ffffff',
      bodyFont: { weight: 'bold' as const, size: 14 },
      callbacks: {
        label: tooltipLabel,
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
      ticks: axisTicks('left'),
    },
    ...(hasRightAxis.value
      ? {
          y1: {
            position: 'right' as const,
            beginAtZero: true,
            grid: { display: false },
            border: { display: false },
            ticks: axisTicks('right'),
          },
        }
      : {}),
  },
}))
</script>

<template>
  <div class="relative w-full min-w-0" :style="{ height }">
    <Bar :data="barData" :options="chartOptions" />
  </div>
</template>
