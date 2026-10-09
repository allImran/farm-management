<script setup lang="ts">
import type { Component } from 'vue'

/** One row of a `BaseDropdown`. Renders a button by default; pass `as` (e.g. `NuxtLink`) for links. */
withDefaults(
  defineProps<{
    as?: string | Component
    /** Red styling for destructive actions such as delete or sign out. */
    danger?: boolean
  }>(),
  {
    as: 'button',
    danger: false,
  }
)
</script>

<template>
  <component
    :is="as"
    :type="as === 'button' ? 'button' : undefined"
    role="menuitem"
    class="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
    :class="
      danger
        ? 'text-accent-red hover:bg-red-50 dark:hover:bg-red-500/10'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
    "
  >
    <slot name="icon" />
    <slot />
  </component>
</template>
