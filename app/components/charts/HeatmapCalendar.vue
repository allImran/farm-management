<script setup lang="ts">
interface HeatmapPoint {
  date: string
  value: number
}

const props = withDefaults(
  defineProps<{
    data: HeatmapPoint[]
    weeks?: number
  }>(),
  {
    weeks: 26,
  }
)

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const intensityClasses = [
  'bg-slate-100 dark:bg-slate-800',
  'bg-primary-100 dark:bg-primary-900/40',
  'bg-primary-300 dark:bg-primary-700/60',
  'bg-primary-500 dark:bg-primary-500/80',
  'bg-primary-600 dark:bg-primary-400',
]

const valueByDate = computed(() => {
  const map = new Map<string, number>()
  for (const point of props.data) {
    map.set(point.date, point.value)
  }
  return map
})

const maxValue = computed(() => Math.max(1, ...props.data.map((point) => point.value)))

const getBucket = (value: number | undefined) => {
  if (!value || value <= 0) return 0
  const ratio = value / maxValue.value
  if (ratio > 0.75) return 4
  if (ratio > 0.5) return 3
  if (ratio > 0.25) return 2
  return 1
}

const toDateKey = (date: Date) => date.toISOString().slice(0, 10)

const columns = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const endDayOffset = 6 - today.getDay()
  const gridEnd = new Date(today)
  gridEnd.setDate(gridEnd.getDate() + endDayOffset)

  const totalDays = props.weeks * 7
  const gridStart = new Date(gridEnd)
  gridStart.setDate(gridStart.getDate() - totalDays + 1)

  const weekColumns: { date: Date; key: string; value: number; bucket: number }[][] = []
  let cursor = new Date(gridStart)

  for (let w = 0; w < props.weeks; w++) {
    const week: { date: Date; key: string; value: number; bucket: number }[] = []
    for (let d = 0; d < 7; d++) {
      const key = toDateKey(cursor)
      const value = valueByDate.value.get(key) ?? 0
      week.push({ date: new Date(cursor), key, value, bucket: getBucket(value) })
      cursor.setDate(cursor.getDate() + 1)
    }
    weekColumns.push(week)
  }

  return weekColumns
})

const formatTitle = (key: string, value: number) => `${key}: ${value.toLocaleString()}`
</script>

<template>
  <div class="w-full overflow-x-auto">
    <div class="inline-flex gap-1">
      <div class="flex flex-col gap-1 mr-1 justify-between text-[10px] text-slate-400 dark:text-slate-500 py-0.5">
        <span v-for="(day, i) in dayLabels" :key="day" :class="i % 2 === 0 ? 'opacity-0' : ''">
          {{ day }}
        </span>
      </div>
      <div class="flex gap-1">
        <div v-for="(week, wi) in columns" :key="wi" class="flex flex-col gap-1">
          <div
            v-for="cell in week"
            :key="cell.key"
            :title="formatTitle(cell.key, cell.value)"
            class="w-3 h-3 rounded-sm"
            :class="intensityClasses[cell.bucket]"
          />
        </div>
      </div>
    </div>
    <div class="flex items-center gap-1.5 mt-3 text-[11px] text-slate-400 dark:text-slate-500">
      <span>Less</span>
      <span v-for="(cls, i) in intensityClasses" :key="i" class="w-3 h-3 rounded-sm" :class="cls" />
      <span>More</span>
    </div>
  </div>
</template>
