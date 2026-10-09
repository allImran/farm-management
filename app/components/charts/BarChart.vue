<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
} from 'chart.js'
import type { ChartSeries } from '~/types/charts'

// Line parts are registered so a series can be drawn as a line over the bars.
Chart.register(CategoryScale, LinearScale, BarElement, LineController, LineElement, PointElement, Tooltip, Legend)

interface BarSeries extends ChartSeries {
  data: number[]
  /** Draw this series as a line over the bars (e.g. a running total). */
  type?: 'bar' | 'line'
  /** `right` plots it on a second y-axis with its own scale. */
  axis?: 'left' | 'right'
}

const props = withDefaults(
  defineProps<{
    labels: string[]
    datasets: BarSeries[]
    height?: string
    showLegend?: boolean
  }>(),
  {
    height: '18rem',
    showLegend: false,
  }
)

const { legend, tooltip, seriesLabel, xAxis, yAxis } = useChartTheme()

const formatFor = (axis: 'left' | 'right') => props.datasets.find((dataset) => (dataset.axis ?? 'left') === axis)?.format
const hasRightAxis = computed(() => props.datasets.some((dataset) => dataset.axis === 'right'))

// Chart.js draws line series inside a bar chart (a "mixed chart"), but vue-chartjs types <Bar>
// as bar-only, so the mixed data is cast at this one boundary.
const chartData = computed(
  () =>
    ({
      labels: props.labels,
      datasets: props.datasets.map((dataset) => {
        const common = { label: dataset.label, data: dataset.data, yAxisID: dataset.axis === 'right' ? 'y1' : 'y' }
        if (dataset.type === 'line') {
          return {
            ...common,
            type: 'line' as const,
            borderColor: dataset.color,
            backgroundColor: dataset.color,
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
          ...common,
          type: 'bar' as const,
          backgroundColor: dataset.color,
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 32,
          order: 1,
        }
      }),
    }) as unknown as ChartData<'bar'>,
)

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: legend(props.showLegend),
    tooltip: tooltip(seriesLabel(props.datasets), props.datasets.length > 1),
  },
  scales: {
    x: xAxis(),
    y: yAxis(formatFor('left')),
    ...(hasRightAxis.value ? { y1: { ...yAxis(formatFor('right')), position: 'right' as const, beginAtZero: true, grid: { display: false } } } : {}),
  },
}))
</script>

<template>
  <div class="relative w-full min-w-0" :style="{ height }">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
