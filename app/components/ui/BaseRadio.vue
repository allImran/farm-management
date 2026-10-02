<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string | number | boolean | null
    value: string | number | boolean
    disabled?: boolean
  }>(),
  {
    modelValue: null,
    disabled: false,
  }
)

defineEmits<{
  'update:modelValue': [value: string | number | boolean]
}>()
</script>

<template>
  <label
    class="inline-flex items-center gap-2 select-none"
    :class="disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'"
  >
    <span class="relative inline-flex flex-shrink-0">
      <input
        type="radio"
        class="peer sr-only"
        :checked="modelValue === value"
        :disabled="disabled"
        @change="$emit('update:modelValue', value)"
      />
      <span
        class="flex items-center justify-center w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark-elevated transition-colors peer-checked:border-primary-500 peer-focus-visible:ring-4 peer-focus-visible:ring-primary-300/50"
      >
        <span
          v-if="modelValue === value"
          class="w-2.5 h-2.5 rounded-full bg-primary-500"
        />
      </span>
    </span>
    <span v-if="$slots.default" class="text-sm text-slate-700 dark:text-slate-200">
      <slot />
    </span>
  </label>
</template>
