<script setup lang="ts">
/**
 * Wraps the content that a `BaseTabs` switches between. Holds its height while the newly selected
 * panel loads, so changing tabs doesn't make the page jump (see `useHeightHold`).
 */
const props = defineProps<{
  /** The selected tab (or any value that changes when the panel content swaps). */
  active: string
}>()

const root = useTemplateRef<HTMLElement>('root')
useHeightHold(root, () => props.active)
</script>

<template>
  <div ref="root">
    <slot />
  </div>
</template>
