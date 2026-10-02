<script setup lang="ts">
withDefaults(
  defineProps<{
    padded?: boolean
    hover?: boolean
  }>(),
  {
    padded: true,
    hover: false,
  }
)
</script>

<template>
  <div
    class="w-full min-w-0 bg-white dark:bg-surface-dark-elevated rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft overflow-hidden"
    :class="[padded ? 'p-6' : '', hover ? 'transition-shadow hover:shadow-card' : '']"
  >
    <div v-if="$slots.header" class="flex items-center justify-between mb-4">
      <slot name="header" />
    </div>
    <slot />
  </div>
</template>
