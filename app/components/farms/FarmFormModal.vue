<script setup lang="ts">
import type { FarmInput } from '~/types/models'
import type { AppError } from '~/types/network'
import type { FormErrors } from '~/composables/useEntityForm'

/** Create/edit farm modal; state and submit logic come from `useFarmForm`. */
defineProps<{
  isEditing: boolean
  errors: FormErrors
  error: AppError | null
  loading: boolean
}>()

const isOpen = defineModel<boolean>('open', { required: true })
const values = defineModel<FarmInput>('values', { required: true })

defineEmits<{
  submit: []
}>()

const { t } = useI18n()
</script>

<template>
  <BaseModal v-model="isOpen" :title="isEditing ? t('farms.edit') : t('farms.add')">
    <form id="farm-form" class="space-y-4" novalidate @submit.prevent="$emit('submit')">
      <BaseInput v-model="values.name" :label="t('farms.fields.name')" :error="errors.name" required />
      <BaseInput v-model="values.location" :label="t('farms.fields.location')" :hint="t('farms.fields.locationHint')" :error="errors.location" />
      <BaseTextarea v-model="values.address" :label="t('farms.fields.address')" :error="errors.address" :rows="2" />
      <BaseAlert v-if="error" variant="error">{{ error.message }}</BaseAlert>
    </form>
    <template #footer>
      <BaseButton variant="ghost" @click="isOpen = false">{{ t('common.cancel') }}</BaseButton>
      <BaseButton type="submit" form="farm-form" :loading="loading">{{ t('common.save') }}</BaseButton>
    </template>
  </BaseModal>
</template>
