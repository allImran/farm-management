<script setup lang="ts">
type Position = 'top' | 'bottom' | 'left' | 'right'

withDefaults(
  defineProps<{
    text?: string
    position?: Position
  }>(),
  {
    position: 'top',
  }
)

const positionClasses: Record<Position, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}
</script>

<template>
  <span class="relative inline-flex group">
    <slot />
    <span
      class="pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-slate-900 dark:bg-slate-700 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 group-hover:animate-fade-in transition-opacity duration-150 shadow-popover"
      :class="positionClasses[position]"
    >
      <slot name="content">{{ text }}</slot>
    </span>
  </span>
</template>
