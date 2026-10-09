<script setup lang="ts">
import { onClickOutside, onKeyStroke } from '@vueuse/core'

/**
 * Popover menu anchored to a trigger. The `trigger` slot receives `{ isOpen, toggle }` and must
 * render the button; the default slot holds `BaseDropdownItem`s. Closes on outside click, Escape,
 * or after any item is clicked.
 */
withDefaults(
  defineProps<{
    /** Tailwind width class for the panel. */
    width?: string
  }>(),
  {
    width: 'w-48',
  }
)

const isOpen = ref(false)
const rootRef = useTemplateRef<HTMLElement>('root')

const toggle = () => {
  isOpen.value = !isOpen.value
}
const close = () => {
  isOpen.value = false
}

onClickOutside(rootRef, close)
onKeyStroke('Escape', close)
</script>

<template>
  <div ref="root" class="relative">
    <slot name="trigger" :is-open="isOpen" :toggle="toggle" />

    <Transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="isOpen"
        role="menu"
        class="absolute right-0 z-20 mt-2 rounded-2xl bg-white dark:bg-surface-dark-elevated border border-slate-100 dark:border-slate-800 shadow-popover p-1.5 origin-top-right"
        :class="width"
        @click="close"
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>
