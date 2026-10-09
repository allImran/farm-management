<script setup lang="ts">
import { onClickOutside, onKeyStroke, useEventListener } from '@vueuse/core'

/**
 * Popover menu anchored to a trigger. The `trigger` slot receives `{ isOpen, toggle }` and must
 * render the button; the default slot holds `BaseDropdownItem`s. Closes on outside click, Escape,
 * scroll/resize, or after any item is clicked.
 *
 * The panel is teleported to `<body>` with fixed positioning so cards and tables with
 * `overflow-hidden` (BaseCard, BaseTable) don't clip it. It opens below the trigger, or above
 * when there isn't room below.
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

const PANEL_GAP = 8
// Rough panel height used to decide whether to open upwards; menus here hold a few items.
const FLIP_THRESHOLD = 160

const isOpen = ref(false)
const isAbove = ref(false)
const position = ref<{ top?: string; bottom?: string; right: string }>({ right: '0px' })
const rootRef = useTemplateRef<HTMLElement>('root')
const panelRef = useTemplateRef<HTMLElement>('panel')

const updatePosition = () => {
  const rect = rootRef.value?.getBoundingClientRect()
  if (!rect) return
  const right = `${window.innerWidth - rect.right}px`
  isAbove.value = window.innerHeight - rect.bottom < FLIP_THRESHOLD && rect.top > FLIP_THRESHOLD
  position.value = isAbove.value
    ? { bottom: `${window.innerHeight - rect.top + PANEL_GAP}px`, right }
    : { top: `${rect.bottom + PANEL_GAP}px`, right }
}

const toggle = () => {
  if (!isOpen.value) updatePosition()
  isOpen.value = !isOpen.value
}
const close = () => {
  isOpen.value = false
}

onClickOutside(rootRef, close, { ignore: [panelRef] })
onKeyStroke('Escape', close)
// A fixed panel would drift away from its trigger, so close instead of tracking movement.
useEventListener('scroll', () => isOpen.value && close(), { capture: true, passive: true })
useEventListener('resize', () => isOpen.value && close(), { passive: true })
</script>

<template>
  <div ref="root" class="relative">
    <slot name="trigger" :is-open="isOpen" :toggle="toggle" />

    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-150"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="isOpen"
          ref="panel"
          role="menu"
          class="fixed z-50 rounded-2xl bg-white dark:bg-surface-dark-elevated border border-slate-100 dark:border-slate-800 shadow-popover p-1.5"
          :class="[width, isAbove ? 'origin-bottom-right' : 'origin-top-right']"
          :style="position"
          @click="close"
        >
          <slot />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
