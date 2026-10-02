<script setup lang="ts">
import {
  Bird,
  Egg,
  Skull,
  Wheat,
  CalendarClock,
  Tags,
  ImageOff,
  ClipboardList,
} from '@lucide/vue'

const { monthlyRevenue, productionMix, flocks, orders, heatmapData } = useMockData()

const barLabels = monthlyRevenue.map((m) => m.label)
const barDatasets = [{ label: 'Revenue', data: monthlyRevenue.map((m) => m.value) }]

const orderColumns = [
  { key: 'id', label: 'Order' },
  { key: 'customer', label: 'Customer' },
  { key: 'date', label: 'Date', sortable: true },
  { key: 'birds', label: 'Birds' },
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'status', label: 'Status' },
]

const statusTone: Record<string, 'green' | 'blue' | 'yellow' | 'red'> = {
  Delivered: 'green',
  Processing: 'blue',
  Pending: 'yellow',
  Cancelled: 'red',
}

const activityItems = [
  { id: 1, icon: Egg, title: 'Batch A-114 recorded 11,240 eggs today', timestamp: '10 minutes ago', tone: 'yellow' as const },
  { id: 2, icon: Wheat, title: 'Feed delivery arrived at House 3', timestamp: '48 minutes ago', tone: 'green' as const },
  { id: 3, icon: Skull, title: 'Mortality spike flagged in Batch B-209', timestamp: '2 hours ago', tone: 'red' as const },
  { id: 4, icon: Bird, title: 'Batch C-301 vaccination completed', timestamp: '5 hours ago', tone: 'blue' as const },
]
</script>

<template>
  <AppShell>
    <div class="max-w-[1600px] mx-auto space-y-6">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Good Morning, Arafat</h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1">An overview of your flocks, production &amp; sales performance.</p>
        </div>
        <BaseButton variant="primary">+ New Flock Batch</BaseButton>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Total Birds" value="69,400" :icon="Bird" tone="yellow" trend="up" trend-value="+8.2%" />
        <StatCard label="Mortality Rate" value="2.4%" :icon="Skull" tone="red" trend="down" trend-value="-0.6%" />
        <StatCard label="Feed Consumption" value="18.2t" :icon="Wheat" tone="green" trend="up" trend-value="+3.1%" />
        <StatCard label="Egg Production" value="52,340" :icon="Egg" tone="blue" trend="up" trend-value="+15%" />
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <BaseCard class="xl:col-span-2">
          <template #header>
            <div>
              <h3 class="font-bold text-slate-900 dark:text-white">Revenue Trend</h3>
              <p class="text-xs text-slate-400 mt-0.5">Monthly sales revenue ($k)</p>
            </div>
            <BaseTabs :tabs="[{ label: 'Monthly', value: 'monthly' }, { label: 'Weekly', value: 'weekly' }]" model-value="monthly" />
          </template>
          <BarChart :labels="barLabels" :datasets="barDatasets" value-prefix="$" height="20rem" />
        </BaseCard>

        <BaseCard>
          <template #header>
            <div>
              <h3 class="font-bold text-slate-900 dark:text-white">Production Mix</h3>
              <p class="text-xs text-slate-400 mt-0.5">This week's distribution</p>
            </div>
          </template>
          <DonutChart :data="productionMix" center-label="Weekly Output" height="14rem" />
        </BaseCard>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <BaseCard class="xl:col-span-2" :padded="false">
          <div class="p-6 pb-0">
            <SectionHeader title="Needs Action &amp; Attention" description="Items that need your review today" />
          </div>
          <div class="px-6 pb-6 grid sm:grid-cols-2 gap-3">
            <ActionItem :icon="ImageOff" title="Picture &amp; data not updated" description="Update improves trust and freshness." priority="medium" action-label="Update Now" />
            <ActionItem :icon="CalendarClock" title="No events scheduled next month" description="You're missing potential bookings." priority="high" action-label="Add Event" action-variant="primary" />
            <ActionItem :icon="ClipboardList" title="Crowd filters are not yet applied" description="Helps guests find you faster." priority="high" action-label="Fix Now" />
            <ActionItem :icon="Tags" title="Let's apply 'Romantic' tag" description="43% of recent searches used this term." priority="high" action-label="Apply Tags" action-variant="primary" />
          </div>
        </BaseCard>

        <BaseCard>
          <template #header>
            <h3 class="font-bold text-slate-900 dark:text-white">Recent Activity</h3>
          </template>
          <ActivityFeed :items="activityItems" />
        </BaseCard>
      </div>

      <BaseCard>
        <template #header>
          <h3 class="font-bold text-slate-900 dark:text-white">Active Flocks</h3>
        </template>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FlockCard v-for="flock in flocks" :key="flock.id" v-bind="flock" />
        </div>
      </BaseCard>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <BaseCard class="xl:col-span-2" :padded="false">
          <div class="p-6 pb-4 flex items-center justify-between">
            <h3 class="font-bold text-slate-900 dark:text-white">Recent Orders</h3>
            <BaseButton variant="ghost" size="sm">View all</BaseButton>
          </div>
          <div class="px-6 pb-6">
            <BaseTable :columns="orderColumns" :rows="orders">
              <template #cell-amount="{ row }">
                <span class="font-semibold">${{ (row.amount as number).toLocaleString() }}</span>
              </template>
              <template #cell-status="{ row }">
                <BaseBadge :tone="statusTone[row.status as string]" size="sm">{{ row.status }}</BaseBadge>
              </template>
            </BaseTable>
          </div>
        </BaseCard>

        <BaseCard>
          <template #header>
            <h3 class="font-bold text-slate-900 dark:text-white">Production Activity</h3>
          </template>
          <HeatmapCalendar :data="heatmapData" :weeks="12" />
        </BaseCard>
      </div>
    </div>
  </AppShell>
</template>
