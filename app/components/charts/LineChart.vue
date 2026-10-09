<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ScriptableContext,
} from 'chart.js'
import type { ChartSeries } from '~/types/charts'

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface LineSeries extends ChartSeries {
  /** `null` leaves a gap that the line bridges (e.g. days without a weight sample). */
  data: (number | null)[]
}

const props = withDefaults(
  defineProps<{
    labels: string[]
    datasets: LineSeries[]
    height?: string
    /** Fills the area under each line with a fading gradient of its colour. */
    filled?: boolean
    showLegend?: boolean
  }>(),
  {
    height: '18rem',
    filled: false,
    showLegend: false,
  }
)

const { legend, tooltip, seriesLabel, xAxis, yAxis } = useChartTheme()

const hexToRgba = (hex: string, alpha: number) => {
  const [r, g, b] = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16))
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const areaFill = (color: string) => (context: ScriptableContext<'line'>) => {
  const { ctx, chartArea } = context.chart
  // The chart area is unknown on the very first draw.
  if (!chartArea) return hexToRgba(color, 0.2)
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
  gradient.addColorStop(0, hexToRgba(color, 0.35))
  gradient.addColorStop(1, hexToRgba(color, 0))
  return gradient
}

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map((dataset) => ({
    label: dataset.label,
    data: dataset.data,
    borderColor: dataset.color,
    backgroundColor: props.filled ? areaFill(dataset.color) : dataset.color,
    fill: props.filled,
    spanGaps: true,
    // Monotone smoothing never overshoots the data (e.g. a growth curve never dips).
    cubicInterpolationMode: 'monotone' as const,
    borderWidth: 2.5,
    pointRadius: 0,
    pointHoverRadius: 5,
    pointBackgroundColor: dataset.color,
    pointHoverBackgroundColor: dataset.color,
    pointHoverBorderColor: '#ffffff',
    pointHoverBorderWidth: 2,
  })),
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: legend(props.showLegend),
    tooltip: tooltip(seriesLabel(props.datasets)),
  },
  scales: {
    x: xAxis(),
    y: yAxis(props.datasets[0]?.format),
  },
}))
</script>

<template>
  <div class="relative w-full min-w-0" :style="{ height }">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
