<script setup lang="ts">
import type { Component } from 'vue'

/** One sidebar link; when the sidebar is collapsed only the icon shows, with the label as a tooltip. */
withDefaults(
  defineProps<{
    icon: Component
    label: string
    to: string
    active?: boolean
    collapsed?: boolean
  }>(),
  {
    active: false,
    collapsed: false,
  }
)
</script>

<template>
  <NuxtLink
    :to="to"
    class="group relative flex items-center rounded-xl transition-all duration-200 outline-none focus-visible:ring-4 focus-visible:ring-primary-300"
    :class="[
      collapsed ? 'justify-center px-3 py-3' : 'gap-3 px-3.5 py-2.5',
      active
        ? 'bg-primary-500 text-slate-900 shadow-soft'
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
    ]"
    :aria-label="label"
    :aria-current="active ? 'page' : undefined"
  >
    <component :is="icon" class="w-5 h-5 shrink-0" />
    <span
      class="font-semibold text-sm whitespace-nowrap transition-all duration-200 overflow-hidden"
      :class="collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'"
    >
      {{ label }}
    </span>

    <span
      v-if="collapsed"
      class="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-lg bg-slate-900 dark:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-popover scale-95 origin-left transition-all duration-150 group-hover:opacity-100 group-hover:scale-100"
    >
      {{ label }}
    </span>
  </NuxtLink>
</template>
