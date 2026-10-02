<script setup lang="ts">
import type { Component } from 'vue'
import { Loader2 } from '@lucide/vue'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dark' | 'glass'
type Size = 'sm' | 'md' | 'lg' | 'icon'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    loading?: boolean
    disabled?: boolean
    pill?: boolean
    /** Element or component to render, e.g. 'a' or NuxtLink for navigation. */
    as?: string | Component
  }>(),
  {
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    pill: true,
    as: 'button',
  }
)

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary-500 text-slate-900 hover:bg-primary-400 focus-visible:ring-primary-300 shadow-soft',
  secondary: 'bg-accent-blue text-white hover:bg-blue-600 focus-visible:ring-blue-300 shadow-soft',
  outline:
    'bg-transparent border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:ring-slate-300',
  ghost:
    'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-slate-300',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-300 shadow-soft',
  dark: 'bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-500 shadow-soft dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200',
  // For use on top of dark imagery/media panels, identical in both themes.
  glass: 'bg-white/10 text-white border border-white/25 backdrop-blur hover:bg-white/20 focus-visible:ring-white/40',
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-base px-6 py-3 gap-2',
  icon: 'p-2.5',
}
</script>

<template>
  <component
    :is="as"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-4 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]"
    :class="[
      variantClasses[variant],
      sizeClasses[size],
      pill ? 'rounded-full' : 'rounded-xl',
    ]"
  >
    <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
    <slot v-else name="icon-left" />
    <slot />
    <slot name="icon-right" />
  </component>
</template>
