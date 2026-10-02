<script setup lang="ts">
withDefaults(
  defineProps<{
    name: string
    house: string
    ageDays: number
    birdCount: number
    mortalityRate: number
    status?: 'healthy' | 'warning' | 'critical'
  }>(),
  {
    status: 'healthy',
  }
)

const statusConfig = {
  healthy: { tone: 'green' as const, label: 'Healthy' },
  warning: { tone: 'yellow' as const, label: 'Needs Attention' },
  critical: { tone: 'red' as const, label: 'Critical' },
}
</script>

<template>
  <BaseCard hover>
    <div class="flex items-start justify-between mb-4">
      <div>
        <p class="font-bold text-slate-900 dark:text-white">{{ name }}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ house }}</p>
      </div>
      <BaseBadge :tone="statusConfig[status].tone" size="sm">{{ statusConfig[status].label }}</BaseBadge>
    </div>
    <div class="grid grid-cols-3 gap-3">
      <div>
        <p class="text-xs text-slate-400">Age</p>
        <p class="font-semibold text-slate-800 dark:text-slate-100 text-sm mt-0.5">{{ ageDays }}d</p>
      </div>
      <div>
        <p class="text-xs text-slate-400">Birds</p>
        <p class="font-semibold text-slate-800 dark:text-slate-100 text-sm mt-0.5">{{ birdCount.toLocaleString() }}</p>
      </div>
      <div>
        <p class="text-xs text-slate-400">Mortality</p>
        <p class="font-semibold text-slate-800 dark:text-slate-100 text-sm mt-0.5">{{ mortalityRate }}%</p>
      </div>
    </div>
  </BaseCard>
</template>
