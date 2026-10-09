<script setup lang="ts">
import { Phone } from '@lucide/vue'
import { PHONE_PLACEHOLDER } from '~/constants/ui'

/** `BaseInput` set up for a Bangladeshi mobile number (phone keypad, icon, `01XXXXXXXXX` hint). */
defineProps<{
  label: string
  error?: string
  hint?: string
  optional?: boolean
  required?: boolean
  readonly?: boolean
  /** `username` on sign-in forms, where the phone number is the login id. */
  autocomplete?: string
}>()

const value = defineModel<string>({ required: true })
</script>

<template>
  <BaseInput
    v-model="value"
    :label="label"
    :error="error"
    :hint="hint"
    :optional="optional"
    :required="required"
    :readonly="readonly"
    :autocomplete="autocomplete ?? 'tel'"
    type="tel"
    inputmode="tel"
    :placeholder="PHONE_PLACEHOLDER"
  >
    <template #icon-left><Phone class="w-4 h-4" /></template>
  </BaseInput>
</template>
