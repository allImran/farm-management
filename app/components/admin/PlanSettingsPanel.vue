<script setup lang="ts">
import { INCLUDED_FARMS } from '~/constants/billing'

/** Prices, bKash number and instructions shown to users in the payment modal. */
const { t } = useI18n()
const { values, errors, loadStatus, loadError, saveStatus, saveError, isSaved, reload, handleSubmit } = usePlanSettings()
</script>

<template>
  <BaseCard class="max-w-2xl">
    <BaseAsyncState :status="loadStatus" :error="loadError" @retry="reload">
      <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('admin.plan.description') }}</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput
            v-model="values.monthlyPrice"
            type="number"
            inputmode="decimal"
            min="0"
            step="any"
            :label="`${t('admin.plan.monthlyPrice')} (${t('units.taka')})`"
            :error="errors.monthlyPrice"
            required
          />
          <BaseInput
            v-model="values.extraFarmPrice"
            type="number"
            inputmode="decimal"
            min="0"
            step="any"
            :label="`${t('admin.plan.extraFarmPrice')} (${t('units.taka')})`"
            :hint="t('admin.plan.extraFarmPriceHint', { included: INCLUDED_FARMS })"
            :error="errors.extraFarmPrice"
            required
          />
          <BasePhoneInput v-model="values.bkashNumber" :label="t('admin.plan.bkashNumber')" :error="errors.bkashNumber" required />
        </div>
        <BaseTextarea
          v-model="values.instructions"
          :label="t('admin.plan.instructions')" optional
          :placeholder="t('admin.plan.instructionsPlaceholder')"
          :error="errors.instructions"
          :rows="4"
        />
        <BaseAlert v-if="saveError" variant="error">{{ saveError.message }}</BaseAlert>
        <BaseAlert v-else-if="isSaved" variant="success">{{ t('admin.plan.saved') }}</BaseAlert>
        <div class="flex justify-end">
          <BaseButton type="submit" :loading="saveStatus === 'loading'">{{ t('common.save') }}</BaseButton>
        </div>
      </form>
    </BaseAsyncState>
  </BaseCard>
</template>
