<script setup lang="ts">
import { CONTACT_TYPES } from '~/constants/farm'
import type { FormErrors } from '~/composables/useEntityForm'
import type { ContactInput, ContactType } from '~/types/models'
import type { AppError } from '~/types/network'

/** Create/edit contact modal; state and submit logic come from `useContactForm`. */
defineProps<{
  isEditing: boolean
  errors: FormErrors
  error: AppError | null
  loading: boolean
}>()

const isOpen = defineModel<boolean>('open', { required: true })
const values = defineModel<ContactInput>('values', { required: true })

defineEmits<{
  submit: []
}>()

const { t } = useI18n()

const toggleType = (type: ContactType, isChecked: boolean) => {
  values.value.types = isChecked ? [...values.value.types, type] : values.value.types.filter((value) => value !== type)
}
</script>

<template>
  <BaseModal v-model="isOpen" :title="isEditing ? t('contacts.edit') : t('contacts.add')">
    <form id="contact-form" class="space-y-4" novalidate @submit.prevent="$emit('submit')">
      <BaseInput v-model="values.name" :label="t('contacts.fields.name')" :error="errors.name" required />
      <BaseInput
        v-model="values.phone"
        :label="`${t('contacts.fields.phone')} (${t('common.optional')})`"
        :error="errors.phone"
        type="tel"
        inputmode="tel"
        placeholder="01XXXXXXXXX"
      />
      <fieldset>
        <legend class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">{{ t('contacts.fields.types') }}</legend>
        <div class="flex flex-wrap gap-x-5 gap-y-3">
          <BaseCheckbox
            v-for="type in CONTACT_TYPES"
            :key="type"
            :model-value="values.types.includes(type)"
            @update:model-value="toggleType(type, $event)"
          >
            {{ t(`options.contactTypes.${type}`) }}
          </BaseCheckbox>
        </div>
      </fieldset>
      <BaseTextarea v-model="values.address" :label="`${t('contacts.fields.address')} (${t('common.optional')})`" :error="errors.address" :rows="2" />
      <BaseTextarea v-model="values.notes" :label="`${t('contacts.fields.notes')} (${t('common.optional')})`" :error="errors.notes" :rows="2" />
      <BaseAlert v-if="error" variant="error">{{ error.message }}</BaseAlert>
    </form>
    <template #footer>
      <BaseButton variant="ghost" @click="isOpen = false">{{ t('common.cancel') }}</BaseButton>
      <BaseButton type="submit" form="contact-form" :loading="loading">{{ t('common.save') }}</BaseButton>
    </template>
  </BaseModal>
</template>
