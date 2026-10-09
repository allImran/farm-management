<script setup lang="ts">
import { MAX_GRANT_MONTHS } from '~/constants/billing'
import { lastAccessDay } from '~/utils/subscription'
import type { useSubscriptionGrant } from '~/composables/useSubscriptionGrant'

/** Approve a request / change a user's access: months, lifetime free, or a custom date range. */
const props = defineProps<{
  grant: ReturnType<typeof useSubscriptionGrant>
}>()

const { t } = useI18n()
const { formatDate } = useLocaleDate()
const { isOpen, target, current, currentStatus, mode, months, startDate, endDate, preview, status, error, rangeError } = props.grant

const MODES = ['months', 'lifetime', 'range'] as const

const previewText = computed(() => {
  if (!preview.value) return ''
  if (preview.value.type === 'lifetime') return t('admin.grant.previewLifetime')
  return t('admin.grant.previewPeriod', { start: formatDate(preview.value.startsAt), end: formatDate(lastAccessDay(preview.value.endsAt)) })
})
const isLoading = computed(() => status.value === 'loading')
const title = computed(() => (target.value?.request ? t('admin.grant.approveTitle') : t('admin.grant.manageTitle')))
</script>

<template>
  <BaseModal v-model="isOpen" :title="title">
    <div v-if="target" class="space-y-5">
      <BasePanel class="text-sm space-y-1">
        <p class="font-semibold text-slate-900 dark:text-white">{{ target.userName }} · {{ target.userPhone }}</p>
        <p v-if="target.request" class="text-slate-600 dark:text-slate-300">
          {{ t('admin.requests.paidFrom', { digits: target.request.bkashLast4 }) }}
        </p>
        <div class="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
          <span>{{ t('admin.grant.current') }}</span>
          <BaseSpinner v-if="currentStatus === 'loading'" size="sm" />
          <SubscriptionBadge v-else :subscription="current" />
        </div>
      </BasePanel>

      <fieldset>
        <legend class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">{{ t('admin.grant.mode') }}</legend>
        <div class="flex flex-wrap gap-x-5 gap-y-3">
          <BaseRadio v-for="option in MODES" :key="option" v-model="mode" :value="option">{{ t(`admin.grant.modes.${option}`) }}</BaseRadio>
        </div>
      </fieldset>

      <BaseNumberStepper
        v-if="mode === 'months'"
        v-model="months"
        :label="t('admin.grant.months')"
        :min="1"
        :max="MAX_GRANT_MONTHS"
        :suffix="t('admin.grant.monthsSuffix', months)"
      />
      <div v-else-if="mode === 'range'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseInput v-model="startDate" type="date" :label="t('admin.grant.startDate')" />
        <BaseInput v-model="endDate" type="date" :label="t('admin.grant.endDate')" :error="rangeError" />
      </div>

      <BaseAlert v-if="previewText" variant="info">{{ previewText }}</BaseAlert>
      <BaseAlert v-if="error" variant="error">{{ error.message }}</BaseAlert>
    </div>

    <template #footer>
      <BaseButton
        v-if="!target?.request && current"
        variant="ghost"
        class="mr-auto text-red-600 dark:text-red-400"
        :disabled="isLoading"
        @click="grant.handleRevoke"
      >
        {{ t('admin.grant.revoke') }}
      </BaseButton>
      <BaseButton variant="ghost" :disabled="isLoading" @click="isOpen = false">{{ t('common.cancel') }}</BaseButton>
      <BaseButton :loading="isLoading" :disabled="currentStatus !== 'success'" @click="grant.handleSubmit">
        {{ target?.request ? t('admin.grant.approve') : t('common.save') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
