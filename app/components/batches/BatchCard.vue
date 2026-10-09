<script setup lang="ts">
import { Bird, CalendarDays } from '@lucide/vue'
import { NuxtLink } from '#components'
import { ROUTES } from '~/constants/routes'
import type { Batch } from '~/types/models'
import { daysSince } from '~/utils/date'

const props = defineProps<{
  batch: Batch
}>()

const { t } = useI18n()
const { formatNumber } = useLocaleNumber()
const { formatDate } = useLocaleDate()

// Active batches show their age as the headline; closed ones only have a start date worth showing.
const isActive = computed(() => props.batch.status === 'active')
const ageDays = computed(() => daysSince(props.batch.startDate))
</script>

<template>
  <NuxtLink
    :to="ROUTES.batch(batch.id)"
    class="block rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300"
  >
    <BaseCard hover class="h-full">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h3 class="font-semibold text-slate-900 dark:text-white truncate">{{ batch.name }}</h3>
          <p v-if="batch.breed" class="text-sm text-slate-500 dark:text-slate-400 truncate">{{ batch.breed }}</p>
        </div>
        <BatchStatusBadge :status="batch.status" />
      </div>
      <!-- Two equal value-over-label columns keep both sides the same weight; dt stays first for valid markup. -->
      <dl class="mt-4 grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 pt-4 dark:divide-slate-800 dark:border-slate-800">
        <div class="flex min-w-0 flex-col-reverse pr-4">
          <dt class="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">{{ t('batches.fields.initialQuantity') }}</dt>
          <dd class="flex items-center gap-1.5 text-lg font-semibold text-slate-900 dark:text-white">
            <Bird class="w-4 h-4 shrink-0 text-slate-400" aria-hidden="true" />
            {{ formatNumber(batch.initialQuantity) }}
          </dd>
        </div>
        <div class="flex min-w-0 flex-col-reverse pl-4">
          <dt class="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">
            {{ isActive ? t('batches.startedOn', { date: formatDate(batch.startDate) }) : t('batches.fields.startDate') }}
          </dt>
          <dd class="flex items-center gap-1.5 text-lg font-semibold text-slate-900 dark:text-white">
            <CalendarDays class="w-4 h-4 shrink-0 text-slate-400" aria-hidden="true" />
            <span class="truncate">{{ isActive ? t('batches.ageDays', { days: formatNumber(ageDays) }) : formatDate(batch.startDate) }}</span>
          </dd>
        </div>
      </dl>
    </BaseCard>
  </NuxtLink>
</template>
