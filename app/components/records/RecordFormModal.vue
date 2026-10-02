<script setup lang="ts">
import type { FormErrors } from '~/composables/useEntityForm'
import type { RecordFormValues } from '~/composables/useRecords'
import type { RecordFieldDef, RecordKind } from '~/types/records'
import type { AppError } from '~/types/network'

/** Create/edit modal for any record kind; fields come from `constants/records.ts`. */
const props = defineProps<{
  kind: RecordKind
  fields: RecordFieldDef[]
  isEditing: boolean
  errors: FormErrors
  error: AppError | null
  loading: boolean
}>()

const isOpen = defineModel<boolean>('open', { required: true })
const values = defineModel<RecordFormValues>('values', { required: true })

defineEmits<{
  submit: []
}>()

const { t } = useI18n()
const formId = computed(() => `record-form-${props.kind}`)
const title = computed(() => t(props.isEditing ? 'records.edit' : 'records.add', { name: t(`records.${props.kind}.singular`) }))
</script>

<template>
  <BaseModal v-model="isOpen" :title="title">
    <form :id="formId" class="grid grid-cols-1 sm:grid-cols-2 gap-4" novalidate @submit.prevent="$emit('submit')">
      <BaseInput v-model="values.date" type="date" :label="t('common.date')" :error="errors.date" required />
      <RecordFieldInput
        v-for="field in fields"
        :key="field.key"
        :model-value="values[field.key] ?? ''"
        @update:model-value="values[field.key] = $event"
        :kind="kind"
        :field="field"
        :error="errors[field.key]"
        :class="field.type === 'textarea' ? 'sm:col-span-2' : ''"
      />
      <BaseAlert v-if="error" variant="error" class="sm:col-span-2">{{ error.message }}</BaseAlert>
    </form>
    <template #footer>
      <BaseButton variant="ghost" @click="isOpen = false">{{ t('common.cancel') }}</BaseButton>
      <BaseButton type="submit" :form="formId" :loading="loading">{{ t('common.save') }}</BaseButton>
    </template>
  </BaseModal>
</template>
