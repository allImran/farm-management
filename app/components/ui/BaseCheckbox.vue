<script setup lang="ts">
import { Check } from '@lucide/vue'

withDefaults(
  defineProps<{
    modelValue?: boolean
    disabled?: boolean
  }>(),
  {
    modelValue: false,
    disabled: false,
  }
)

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <label
    class="inline-flex items-center gap-2 select-none"
    :class="disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'"
  >
    <span class="relative inline-flex flex-shrink-0">
      <input
        type="checkbox"
        class="peer sr-only"
        :checked="modelValue"
        :disabled="disabled"
        @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      />
      <span
        class="flex items-center justify-center w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark-elevated transition-colors peer-checked:bg-primary-500 peer-checked:border-primary-500 peer-focus-visible:ring-4 peer-focus-visible:ring-primary-300/50"
      >
        <Check
          v-if="modelValue"
          class="w-3.5 h-3.5 text-slate-900"
          :stroke-width="3"
        />
      </span>
    </span>
    <span v-if="$slots.default" class="text-sm text-slate-700 dark:text-slate-200">
      <slot />
    </span>
  </label>
</template>
