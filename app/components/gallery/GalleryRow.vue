<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
  }>(),
  {}
)
</script>

<template>
  <div>
    <p v-if="label" class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">{{ label }}</p>
    <div class="flex flex-wrap items-center gap-3">
      <slot />
    </div>
  </div>
</template>
