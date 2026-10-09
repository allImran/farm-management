<script setup lang="ts">
import { Eye, EyeOff } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    label?: string
    type?: string
    placeholder?: string
    error?: string
    hint?: string
    optional?: boolean
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    autocomplete?: string
    inputmode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email'
    min?: string | number
    max?: string | number
    step?: string | number
    maxlength?: number
  }>(),
  {
    modelValue: '',
    type: 'text',
  }
)

defineEmits<{
  'update:modelValue': [value: string]
}>()

// Password fields get a show/hide button; typing on a phone keyboard is error-prone.
const isPassword = computed(() => props.type === 'password')
const isPasswordVisible = ref(false)
const inputType = computed(() => (isPassword.value && isPasswordVisible.value ? 'text' : props.type))
</script>

<template>
  <BaseField v-slot="{ id, describedBy, controlClass }" :label="label" :error="error" :hint="hint" :optional="optional">
    <div class="relative flex items-center">
      <span v-if="$slots['icon-left']" class="absolute left-3 flex items-center text-slate-400 dark:text-slate-500">
        <slot name="icon-left" />
      </span>
      <input
        :id="id"
        :value="modelValue"
        :type="inputType"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :min="min"
        :max="max"
        :step="step"
        :maxlength="maxlength"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="describedBy"
        class="read-only:bg-slate-50 dark:read-only:bg-slate-800/60"
        :class="[controlClass, $slots['icon-left'] ? 'pl-10' : '', isPassword ? 'pr-11' : '']"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        v-if="isPassword"
        type="button"
        class="absolute right-0.5 flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:text-slate-500 dark:hover:text-slate-300"
        :aria-label="$t(isPasswordVisible ? 'common.hidePassword' : 'common.showPassword')"
        :aria-pressed="isPasswordVisible"
        :disabled="disabled"
        @click="isPasswordVisible = !isPasswordVisible"
      >
        <EyeOff v-if="isPasswordVisible" class="w-4 h-4" />
        <Eye v-else class="w-4 h-4" />
      </button>
    </div>
  </BaseField>
</template>
