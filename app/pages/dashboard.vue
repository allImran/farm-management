<script setup lang="ts">
import { ArrowRight, Bird, Layers, Warehouse } from '@lucide/vue'
import { NuxtLink } from '#components'
import { ROUTES } from '~/constants/routes'

definePageMeta({ layout: 'app', middleware: 'auth' })

const { t } = useI18n()
const { formatNumber } = useLocaleNumber()
const { profile } = storeToRefs(useAuthStore())
const { summary, status, error, reload, activeBatches } = useDashboard()

const hasNoFarms = computed(() => summary.value?.farms === 0)

useSeoMeta({ title: () => t('dashboard.title') })
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-8">
    <PageHeader :title="t('dashboard.greeting', { name: profile?.name ?? '' })" :description="t('dashboard.description')" />

    <BaseAsyncState :status="status" :error="error" @retry="reload">
      <template #loading>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BaseSkeleton v-for="i in 3" :key="i" variant="rect" height="6rem" />
        </div>
      </template>
      <div v-if="summary" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard :label="t('dashboard.stats.farms')" :value="formatNumber(summary.farms)" :icon="Warehouse" tone="yellow" />
        <StatCard :label="t('dashboard.stats.activeBatches')" :value="formatNumber(summary.activeBatches)" :icon="Layers" tone="green" />
        <StatCard :label="t('dashboard.stats.birds')" :value="formatNumber(summary.birds)" :icon="Bird" tone="blue" />
      </div>
    </BaseAsyncState>

    <BaseCard v-if="hasNoFarms">
      <BaseEmptyState :title="t('dashboard.onboardingTitle')" :description="t('dashboard.onboardingDescription')">
        <template #icon><Warehouse class="w-7 h-7" /></template>
        <template #action>
          <BaseButton :as="NuxtLink" :to="ROUTES.farms">{{ t('farms.add') }}</BaseButton>
        </template>
      </BaseEmptyState>
    </BaseCard>

    <section v-else>
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('dashboard.activeBatches') }}</h2>
        <BaseButton :as="NuxtLink" :to="ROUTES.farms" variant="ghost" size="sm">
          {{ t('dashboard.allFarms') }}
          <template #icon-right><ArrowRight class="w-4 h-4" /></template>
        </BaseButton>
      </div>
      <BaseAsyncState
        :status="activeBatches.status.value"
        :error="activeBatches.error.value"
        :is-empty="activeBatches.isEmpty.value"
        :empty-title="t('dashboard.noActiveTitle')"
        :empty-description="t('dashboard.noActiveDescription')"
        @retry="activeBatches.reset"
      >
        <ul class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <li v-for="batch in activeBatches.items.value" :key="batch.id"><BatchCard :batch="batch" /></li>
        </ul>
      </BaseAsyncState>
    </section>
  </div>
</template>
