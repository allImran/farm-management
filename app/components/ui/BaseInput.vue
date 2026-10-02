<script setup lang="ts">
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    label?: string
    type?: string
    placeholder?: string
    error?: string
    disabled?: boolean
    size?: Size
  }>(),
  {
    modelValue: '',
    type: 'text',
    size: 'md',
    disabled: false,
  }
)

defineEmits<{
  'update:modelValue': [value: string]
}>()

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
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        class="w-full rounded-xl border bg-white dark:bg-surface-dark-elevated text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-soft transition-colors focus:outline-none focus:ring-4 focus:ring-primary-300/50 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="[
          sizeClasses[size],
          error
            ? 'border-red-300 dark:border-red-500/50 focus:ring-red-200/50 focus:border-red-400'
            : 'border-slate-200 dark:border-slate-700',
          $slots['icon-left'] ? 'pl-10' : '',
          $slots['icon-right'] ? 'pr-10' : '',
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <span
        v-if="$slots['icon-right']"
        class="absolute right-3 flex items-center text-slate-400 dark:text-slate-500"
      >
        <slot name="icon-right" />
      </span>
    </div>
    <p v-if="error" class="mt-1.5 text-xs font-medium text-red-500 dark:text-red-400">
      {{ error }}
    </p>
  </label>
</template>
