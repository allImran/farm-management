<script setup lang="ts">
import type { AppError } from '~/types/network'

/** Yes/no confirmation in a modal, e.g. before deleting. The parent runs the action on `confirm`. */
withDefaults(
  defineProps<{
    title: string
    message?: string
    confirmLabel?: string
    variant?: 'danger' | 'primary'
    loading?: boolean
    error?: AppError | null
  }>(),
  {
    variant: 'danger',
    loading: false,
    error: null,
  }
)

const isOpen = defineModel<boolean>({ required: true })

defineEmits<{
  confirm: []
}>()
</script>

<template>
  <BaseModal v-model="isOpen" :title="title">
    <p v-if="message" class="text-sm text-slate-600 dark:text-slate-300">{{ message }}</p>
    <slot />
    <BaseAlert v-if="error" variant="error" class="mt-4">{{ error.message }}</BaseAlert>
    <template #footer>
      <BaseButton variant="ghost" :disabled="loading" @click="isOpen = false">{{ $t('common.cancel') }}</BaseButton>
      <BaseButton :variant="variant" :loading="loading" @click="$emit('confirm')">
        {{ confirmLabel ?? $t('common.confirm') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
