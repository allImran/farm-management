<script setup lang="ts">
import type { RecordFormValues } from '~/composables/useRecords'
import type { EntityFormModalProps } from '~/types/forms'
import type { RecordFieldDef, RecordKind } from '~/types/records'

/** Create/edit modal for any record kind; fields come from `constants/records.ts`. */
const props = defineProps<EntityFormModalProps & { kind: RecordKind; fields: RecordFieldDef[] }>()

const isOpen = defineModel<boolean>('open', { required: true })
const values = defineModel<RecordFormValues>('values', { required: true })

defineEmits<{
  submit: []
}>()

const { t } = useI18n()
const title = computed(() => t(props.isEditing ? 'records.edit' : 'records.add', { name: t(`records.${props.kind}.singular`) }))
</script>

<template>
  <BaseFormModal v-model="isOpen" :title="title" :columns="2" :loading="loading" :error="error" @submit="$emit('submit')">
    <BaseInput v-model="values.date" type="date" :label="t('common.date')" :error="errors.date" required />
    <RecordFieldInput
      v-for="field in fields"
      :key="field.key"
      :model-value="values[field.key] ?? ''"
      :kind="kind"
      :field="field"
      :error="errors[field.key]"
      :class="field.type === 'textarea' ? 'sm:col-span-2' : ''"
      @update:model-value="values[field.key] = $event"
    />
  </BaseFormModal>
</template>
