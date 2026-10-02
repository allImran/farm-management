<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    placeholder?: string
    error?: string
    disabled?: boolean
    rows?: number
  }>(),
  {
    modelValue: '',
    rows: 4,
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
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      class="w-full rounded-xl border bg-white dark:bg-surface-dark-elevated text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-soft text-sm px-3.5 py-2.5 transition-colors resize-y focus:outline-none focus:ring-4 focus:ring-primary-300/50 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      :class="
        error
          ? 'border-red-300 dark:border-red-500/50 focus:ring-red-200/50 focus:border-red-400'
          : 'border-slate-200 dark:border-slate-700'
      "
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <p v-if="error" class="mt-1.5 text-xs font-medium text-red-500 dark:text-red-400">
      {{ error }}
    </p>
  </label>
</template>
