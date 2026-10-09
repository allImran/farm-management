<script setup lang="ts">
import { BATCH_STATUSES } from '~/constants/farm'
import type { BatchFormValues } from '~/composables/useBatches'
import type { EntityFormModalProps } from '~/types/forms'

/** Create/edit batch modal; state and submit logic come from `useBatchForm`. */
defineProps<EntityFormModalProps>()

const isOpen = defineModel<boolean>('open', { required: true })
const values = defineModel<BatchFormValues>('values', { required: true })

defineEmits<{
  submit: []
}>()

const { t } = useI18n()
const statusOptions = computed(() => BATCH_STATUSES.map((value) => ({ value, label: t(`batches.status.${value}`) })))
</script>

<template>
  <BaseFormModal
    v-model="isOpen"
    :title="isEditing ? t('batches.edit') : t('batches.add')"
    :columns="2"
    :loading="loading"
    :error="error"
    @submit="$emit('submit')"
  >
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
    <BaseTextarea v-model="values.note" class="sm:col-span-2" :label="t('common.note')" optional :error="errors.note" :rows="2" />
  </BaseFormModal>
</template>
