<script setup lang="ts">
type Size = 'sm' | 'md'

const props = withDefaults(
  defineProps<{
    name: string
    size?: Size
  }>(),
  {
    size: 'md',
  }
)

const sizeClasses: Record<Size, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
}

// "Rahim Uddin" → "RU", "Rahim" → "RA".
const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/)
  const first = parts[0] ?? ''
  if (parts.length === 1) return first.slice(0, 2).toUpperCase()
  return ((first[0] ?? '') + (parts.at(-1)?.[0] ?? '')).toUpperCase()
})
</script>

<template>
  <span
    class="flex flex-shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-800 dark:text-primary-300 font-semibold"
    :class="sizeClasses[size]"
    aria-hidden="true"
  >
    {{ initials }}
  </span>
</template>
