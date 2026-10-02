<script setup lang="ts">
import { computed } from 'vue'

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type Status = 'online' | 'offline' | 'busy'

const props = withDefaults(
  defineProps<{
    src?: string
    name?: string
    size?: Size
    status?: Status
  }>(),
  {
    size: 'md',
  }
)

const sizeClasses: Record<Size, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

const dotSizeClasses: Record<Size, string> = {
  xs: 'w-1.5 h-1.5 border',
  sm: 'w-2 h-2 border',
  md: 'w-2.5 h-2.5 border-2',
  lg: 'w-3 h-3 border-2',
  xl: 'w-3.5 h-3.5 border-2',
}

const statusClasses: Record<Status, string> = {
  online: 'bg-accent-green',
  offline: 'bg-slate-400',
  busy: 'bg-accent-red',
}

const initials = computed(() => {
  if (!props.name) return ''
  const parts = props.name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
})
</script>

<template>
  <span class="relative inline-flex flex-shrink-0" :class="sizeClasses[size]">
    <img
      v-if="src"
      :src="src"
      :alt="name"
      class="w-full h-full rounded-full object-cover"
    />
    <span
      v-else
      class="flex items-center justify-center w-full h-full rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-800 dark:text-primary-300 font-semibold"
    >
      {{ initials }}
    </span>
    <span
      v-if="status"
      class="absolute bottom-0 right-0 rounded-full border-white dark:border-surface-dark-elevated"
      :class="[dotSizeClasses[size], statusClasses[status]]"
    />
  </span>
</template>
