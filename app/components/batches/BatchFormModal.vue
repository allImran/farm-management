<script setup lang="ts">
import { BATCH_STATUSES } from '~/constants/farm'
import type { FormErrors } from '~/composables/useEntityForm'
import type { BatchStatus } from '~/types/models'
import type { AppError } from '~/types/network'

/** Create/edit batch modal; state and submit logic come from `useBatchForm`. */
defineProps<{
  isEditing: boolean
  errors: FormErrors
  error: AppError | null
  loading: boolean
}>()

const isOpen = defineModel<boolean>('open', { required: true })
const values = defineModel<{
  name: string
  breed: string
  startDate: string
  initialQuantity: string
  status: BatchStatus
  note: string
}>('values', { required: true })

defineEmits<{
  submit: []
}>()

const { t } = useI18n()
const statusOptions = computed(() => BATCH_STATUSES.map((value) => ({ value, label: t(`batches.status.${value}`) })))
</script>

<template>
  <BaseModal v-model="isOpen" :title="isEditing ? t('batches.edit') : t('batches.add')">
    <form id="batch-form" class="grid grid-cols-1 sm:grid-cols-2 gap-4" novalidate @submit.prevent="$emit('submit')">
      <BaseInput v-model="values.name" class="sm:col-span-2" :label="t('batches.fields.name')" :placeholder="t('batches.fields.namePlaceholder')" :error="errors.name" required />
      <BaseInput v-model="values.breed" :label="t('batches.fields.breed')" :error="errors.breed" />
      <BaseInput v-model="values.startDate" type="date" :label="t('batches.fields.startDate')" :error="errors.startDate" required />
      <BaseInput
        v-model="values.initialQuantity"
        type="number"
        inputmode="numeric"
        min="1"
        step="1"
        :label="t('batches.fields.initialQuantity')"
        :error="errors.initialQuantity"
        required
      />
      <BaseSelect v-model="values.status" :label="t('batches.fields.status')" :options="statusOptions" />
      <BaseTextarea v-model="values.note" class="sm:col-span-2" :label="`${t('common.note')} (${t('common.optional')})`" :error="errors.note" :rows="2" />
      <BaseAlert v-if="error" variant="error" class="sm:col-span-2">{{ error.message }}</BaseAlert>
    </form>
    <template #footer>
      <BaseButton variant="ghost" @click="isOpen = false">{{ t('common.cancel') }}</BaseButton>
      <BaseButton type="submit" form="batch-form" :loading="loading">{{ t('common.save') }}</BaseButton>
    </template>
  </BaseModal>
</template>
