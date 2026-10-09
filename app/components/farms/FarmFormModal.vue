<script setup lang="ts">
import type { EntityFormModalProps } from '~/types/forms'
import type { FarmInput } from '~/types/models'

/** Create/edit farm modal; state and submit logic come from `useFarmForm`. */
defineProps<EntityFormModalProps>()

const isOpen = defineModel<boolean>('open', { required: true })
const values = defineModel<FarmInput>('values', { required: true })

defineEmits<{
  submit: []
}>()

const { t } = useI18n()
</script>

<template>
  <BaseFormModal v-model="isOpen" :title="isEditing ? t('farms.edit') : t('farms.add')" :loading="loading" :error="error" @submit="$emit('submit')">
    <BaseInput v-model="values.name" :label="t('farms.fields.name')" :error="errors.name" required />
    <BaseTextarea v-model="values.address" :label="t('farms.fields.address')" :hint="t('farms.fields.addressHint')" :error="errors.address" :rows="2" />
  </BaseFormModal>
</template>
