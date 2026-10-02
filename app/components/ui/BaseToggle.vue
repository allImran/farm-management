<script setup lang="ts">
type Size = 'sm' | 'md'

withDefaults(
  defineProps<{
    modelValue?: boolean
    disabled?: boolean
    size?: Size
  }>(),
  {
    modelValue: false,
    disabled: false,
    size: 'md',
  }
)

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const trackSizeClasses: Record<Size, string> = {
  sm: 'w-8 h-4',
  md: 'w-11 h-6',
}

const knobSizeClasses: Record<Size, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
}

const knobTranslateClasses: Record<Size, string> = {
  sm: 'peer-checked:translate-x-3.5',
  md: 'peer-checked:translate-x-5',
}
</script>

<template>
  <label
    class="inline-flex items-center gap-2.5 select-none"
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
        class="block rounded-full bg-slate-300 dark:bg-slate-600 peer-checked:bg-primary-500 transition-colors duration-200 peer-focus-visible:ring-4 peer-focus-visible:ring-primary-300/50"
        :class="trackSizeClasses[size]"
      />
      <span
        class="absolute top-0.5 left-0.5 rounded-full bg-white shadow-soft transition-transform duration-200"
        :class="[knobSizeClasses[size], knobTranslateClasses[size]]"
      />
    </span>
    <span v-if="$slots.default" class="text-sm text-slate-700 dark:text-slate-200">
      <slot />
    </span>
  </label>
</template>
