<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Filler } from 'chart.js'

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Filler)

const props = withDefaults(
  defineProps<{
    data: number[]
    color?: string
    height?: string
    filled?: boolean
  }>(),
  {
    color: '#22c55e',
    height: '2.5rem',
    filled: false,
  }
)

const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const chartData = computed(() => ({
  labels: props.data.map((_, i) => i.toString()),
  datasets: [
    {
      data: props.data,
      borderColor: props.color,
      backgroundColor: props.filled ? hexToRgba(props.color, 0.15) : 'transparent',
      fill: props.filled,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 0,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 0 },
  interaction: { intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
  scales: {
    x: { display: false },
    y: { display: false },
  },
}
</script>

<template>
  <div class="relative w-full min-w-0" :style="{ height }">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
