<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import { Chart, ArcElement, Tooltip } from 'chart.js'

Chart.register(ArcElement, Tooltip)

const props = withDefaults(
  defineProps<{
    value: number
    label?: string
    color?: string
    trackColor?: string
    height?: string
    suffix?: string
  }>(),
  {
    label: '',
    color: '#f5b700',
    trackColor: '',
    height: '10rem',
    suffix: '%',
  }
)

const clampedValue = computed(() => Math.min(100, Math.max(0, props.value)))

const chartData = computed(() => ({
  datasets: [
    {
      data: [clampedValue.value, 100 - clampedValue.value],
      backgroundColor: [props.color, props.trackColor || 'rgba(148, 163, 184, 0.15)'],
      borderWidth: 0,
      circumference: 360,
      rotation: -90,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '80%',
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
}
</script>

<template>
  <div class="relative w-full min-w-0" :style="{ height }">
    <Doughnut :data="chartData" :options="chartOptions" />
    <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span class="text-2xl font-bold text-slate-800 dark:text-slate-100">
        {{ clampedValue }}{{ suffix }}
      </span>
      <span v-if="label" class="text-xs text-slate-400 dark:text-slate-500 mt-1 text-center px-2">
        {{ label }}
      </span>
    </div>
  </div>
</template>
