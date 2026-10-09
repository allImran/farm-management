<script setup lang="ts">
import { INCLUDED_FARMS } from '~/constants/billing'
import type { PlanConfig } from '~/types/models'
import { monthlyFee } from '~/utils/subscription'

/**
 * Asks the user to agree to the monthly extra-farm fee before adding a farm beyond the
 * included ones, showing the monthly fee now and after the new farm.
 */
const props = defineProps<{
  /** Farms the user has now (before adding the new one). */
  farmCount: number
  plan: Pick<PlanConfig, 'monthlyPrice' | 'extraFarmPrice'>
}>()

const isOpen = defineModel<boolean>({ required: true })

defineEmits<{
  confirm: []
}>()

const { t } = useI18n()
const { formatMoney, formatNumber } = useLocaleNumber()

const rows = computed(() => [
  { key: 'price', label: t('farms.extraFee.pricePerFarm'), value: t('billing.request.perMonth', { price: formatMoney(props.plan.extraFarmPrice) }) },
  { key: 'current', label: t('farms.extraFee.currentFee'), value: formatMoney(monthlyFee(props.plan, props.farmCount)) },
  { key: 'next', label: t('farms.extraFee.newFee'), value: formatMoney(monthlyFee(props.plan, props.farmCount + 1)) },
])
</script>

<template>
  <BaseConfirmDialog
    v-model="isOpen"
    variant="primary"
    :title="t('farms.extraFee.title')"
    :message="t('farms.extraFee.message', { included: formatNumber(INCLUDED_FARMS), count: formatNumber(farmCount) })"
    :confirm-label="t('farms.extraFee.confirm')"
    @confirm="$emit('confirm')"
  >
    <BasePanel class="mt-4">
      <dl class="space-y-2">
        <div v-for="row in rows" :key="row.key" class="flex items-center justify-between gap-3">
          <dt class="text-sm text-slate-500 dark:text-slate-400">{{ row.label }}</dt>
          <dd class="font-semibold text-slate-900 dark:text-white" :class="row.key === 'next' ? 'text-lg' : ''">{{ row.value }}</dd>
        </div>
      </dl>
    </BasePanel>
    <p class="mt-3 text-sm text-slate-600 dark:text-slate-300">{{ t('farms.extraFee.whenCharged') }}</p>
  </BaseConfirmDialog>
</template>
