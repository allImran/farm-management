<script setup lang="ts">
import { Eye, EyeOff } from '@lucide/vue'

type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    label?: string
    type?: string
    placeholder?: string
    error?: string
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    size?: Size
    hint?: string
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
    size: 'md',
    disabled: false,
    readonly: false,
    required: false,
  }
)

defineEmits<{
  'update:modelValue': [value: string]
}>()

// Password fields get a show/hide button; typing on a phone keyboard is error-prone.
const isPassword = computed(() => props.type === 'password')
const isPasswordVisible = ref(false)
const inputType = computed(() => (isPassword.value && isPasswordVisible.value ? 'text' : props.type))

const sizeClasses: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-3.5 py-2.5',
  lg: 'text-base px-4 py-3',
}
</script>

<template>
  <label class="block">
    <span
      v-if="label"
      class="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-200"
    >
      {{ label }}
    </span>
    <div class="relative flex items-center">
      <span
        v-if="$slots['icon-left']"
        class="absolute left-3 flex items-center text-slate-400 dark:text-slate-500"
      >
        <slot name="icon-left" />
      </span>
      <input
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
        class="w-full rounded-xl border read-only:bg-slate-50 dark:read-only:bg-slate-800/60 bg-white dark:bg-surface-dark-elevated text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-soft transition-colors focus:outline-none focus:ring-4 focus:ring-primary-300/50 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="[
          sizeClasses[size],
          error
            ? 'border-red-300 dark:border-red-500/50 focus:ring-red-200/50 focus:border-red-400'
            : 'border-slate-200 dark:border-slate-700',
          $slots['icon-left'] ? 'pl-10' : '',
          $slots['icon-right'] ? 'pr-10' : '',
          isPassword ? 'pr-11' : '',
        ]"
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
      <span
        v-else-if="$slots['icon-right']"
        class="absolute right-3 flex items-center text-slate-400 dark:text-slate-500"
      >
        <slot name="icon-right" />
      </span>
    </div>
    <p v-if="error" class="mt-1.5 text-xs font-medium text-red-500 dark:text-red-400">
      {{ error }}
    </p>
    <p v-else-if="hint" class="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
      {{ hint }}
    </p>
  </label>
</template>
