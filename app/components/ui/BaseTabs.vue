<script setup lang="ts">
type Tab = { label: string; value: string }

withDefaults(
  defineProps<{
    tabs: Tab[]
    modelValue: string
  }>(),
  {}
)

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div
    class="inline-flex items-center gap-1 p-1 rounded-full bg-slate-100 dark:bg-surface-dark-elevated"
  >
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      class="px-4 py-2 text-sm font-semibold rounded-full transition-colors"
      :class="
        modelValue === tab.value
          ? 'bg-slate-900 text-white dark:bg-primary-500 dark:text-slate-900 shadow-soft'
          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
      "
      @click="$emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
