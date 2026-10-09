<script setup lang="ts">
import type { AppError } from '~/types/network'

/**
 * Modal around a form with the standard Cancel / Save footer and the save error under the
 * fields. Submitting (button or Enter) emits `submit`; the parent validates and saves.
 */
withDefaults(
  defineProps<{
    title: string
    loading?: boolean
    error?: AppError | null
    /** `2` lays the fields out in two columns from the `sm` breakpoint. */
    columns?: 1 | 2
  }>(),
  {
    loading: false,
    error: null,
    columns: 1,
  }
)

const isOpen = defineModel<boolean>({ required: true })

defineEmits<{
  submit: []
}>()

const formId = useId()
</script>

<template>
  <BaseModal v-model="isOpen" :title="title">
    <form
      :id="formId"
      :class="columns === 2 ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'"
      novalidate
      @submit.prevent="$emit('submit')"
    >
      <slot />
    </form>
    <BaseAlert v-if="error" variant="error" class="mt-4">{{ error.message }}</BaseAlert>
    <template #footer>
      <BaseButton variant="ghost" :disabled="loading" @click="isOpen = false">{{ $t('common.cancel') }}</BaseButton>
      <BaseButton type="submit" :form="formId" :loading="loading">{{ $t('common.save') }}</BaseButton>
    </template>
  </BaseModal>
</template>
