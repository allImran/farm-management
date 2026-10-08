<script setup lang="ts">
type Option = { label: string; value: string | number }

withDefaults(
  defineProps<{
    modelValue?: string | number
    label?: string
    options?: Option[]
    placeholder?: string
    error?: string
    /** Helper text under the field; hidden while an error is shown. */
    hint?: string
    disabled?: boolean
  }>(),
  {
    modelValue: '',
    options: () => [],
    disabled: false,
  }
)

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <label class="block">
    <span
      v-if="label"
      class="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-200"
    >
      {{ label }}
    </span>
    <select
      :value="modelValue"
      :disabled="disabled"
      class="w-full rounded-xl border bg-white dark:bg-surface-dark-elevated text-slate-900 dark:text-slate-100 shadow-soft text-sm px-3.5 py-2.5 transition-colors focus:outline-none focus:ring-4 focus:ring-primary-300/50 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      :class="
        error
          ? 'border-red-300 dark:border-red-500/50 focus:ring-red-200/50 focus:border-red-400'
          : 'border-slate-200 dark:border-slate-700'
      "
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <p v-if="error" class="mt-1.5 text-xs font-medium text-red-500 dark:text-red-400">
      {{ error }}
    </p>
    <p v-else-if="hint" class="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
      {{ hint }}
    </p>
  </label>
</template>
