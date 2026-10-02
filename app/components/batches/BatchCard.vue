<script setup lang="ts">
import { Bird, CalendarDays } from '@lucide/vue'
import { NuxtLink } from '#components'
import { ROUTES } from '~/constants/routes'
import type { Batch } from '~/types/models'
import { daysBetween, parseIsoDate } from '~/utils/date'

const props = defineProps<{
  batch: Batch
}>()

const { t } = useI18n()
const { formatNumber } = useLocaleNumber()
const { formatDate } = useLocaleDate()

const ageDays = computed(() => Math.max(0, daysBetween(parseIsoDate(props.batch.startDate), new Date())))
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
      <dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div class="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Bird class="w-4 h-4 text-slate-400" />
          <dt class="sr-only">{{ t('batches.fields.initialQuantity') }}</dt>
          <dd>{{ formatNumber(batch.initialQuantity) }}</dd>
        </div>
        <div class="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <CalendarDays class="w-4 h-4 text-slate-400" />
          <dt class="sr-only">{{ t('batches.fields.startDate') }}</dt>
          <dd>
            {{ formatDate(batch.startDate) }}
            <span v-if="batch.status === 'active'" class="text-slate-400">· {{ t('batches.ageDays', { days: formatNumber(ageDays) }) }}</span>
          </dd>
        </div>
      </dl>
    </BaseCard>
  </NuxtLink>
</template>
