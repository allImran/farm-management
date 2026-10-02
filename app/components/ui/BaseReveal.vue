<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: string
    /** Stagger offset in ms, for revealing siblings one after another. */
    delay?: number
  }>(),
  {
    as: 'div',
    delay: 0,
  }
)

const el = ref<HTMLElement | null>(null)
const { isHidden } = useReveal(el)
</script>

<template>
  <component
    :is="as"
    ref="el"
    :class="isHidden ? 'opacity-0' : 'animate-reveal motion-reduce:animate-none'"
    :style="delay ? { animationDelay: `${delay}ms` } : undefined"
  >
    <slot />
  </component>
</template>
