<script setup lang="ts">
type Variant = 'text' | 'circle' | 'rect'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    width?: string
    height?: string
  }>(),
  {
    variant: 'text',
  }
)

const variantClasses: Record<Variant, string> = {
  text: 'rounded-md h-4 w-full',
  circle: 'rounded-full w-10 h-10',
  rect: 'rounded-xl w-full h-24',
}
</script>

<template>
  <span
    class="block bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-800 dark:to-slate-700 bg-[length:1000px_100%] animate-shimmer"
    :class="variantClasses[variant]"
    :style="{ width: width, height: height }"
  />
</template>
