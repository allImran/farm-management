<script setup lang="ts" generic="T extends string">
import { useEventListener, useResizeObserver } from '@vueuse/core'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import type { Tab } from '~/types/ui'

/**
 * Pill-style tab bar. On mobile the track spans the full width and the tabs scroll sideways
 * inside it; from `sm` up the track shrinks to fit its tabs.
 */
defineProps<{
  tabs: Tab<T>[]
}>()

const selected = defineModel<T>({ required: true })

const scroller = ref<HTMLElement | null>(null)

// Which edges hide more tabs; drives the edge fades that hint the row can be swiped.
const canScrollStart = ref(false)
const canScrollEnd = ref(false)

function updateOverflow() {
  const el = scroller.value
  if (!el) return
  // 1px slack absorbs sub-pixel rounding of scrollLeft on high-DPI screens.
  canScrollStart.value = el.scrollLeft > 1
  canScrollEnd.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}

useEventListener(scroller, 'scroll', updateOverflow, { passive: true })
useResizeObserver(scroller, updateOverflow)

/**
 * Keeps the active tab visible inside the scroller, e.g. when it comes from the URL and sits
 * off-screen. Adjusts the scroller's own `scrollLeft` rather than calling `scrollIntoView`,
 * which would also scroll the page vertically.
 */
function revealSelected(behavior: ScrollBehavior) {
  const el = scroller.value
  const button = el?.querySelector<HTMLElement>('[aria-pressed="true"]')
  if (!el || !button) return
  // The scroller is `relative`, so it's the button's offsetParent.
  const start = button.offsetLeft
  const end = start + button.offsetWidth
  if (start < el.scrollLeft) el.scrollTo({ left: start, behavior })
  else if (end > el.scrollLeft + el.clientWidth) el.scrollTo({ left: end - el.clientWidth, behavior })
}

/** Pages the row by most of its visible width, keeping a sliver of the previous tabs for context. */
function scrollByPage(direction: 1 | -1) {
  const el = scroller.value
  if (!el) return
  el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: 'smooth' })
}

onMounted(() => {
  revealSelected('auto')
  updateOverflow()
})
watch(selected, () => nextTick(() => revealSelected('smooth')))
</script>

<template>
  <div class="relative flex w-full sm:w-fit sm:max-w-full p-1 rounded-full bg-slate-100 dark:bg-surface-dark-elevated">
    <div
      ref="scroller"
      class="relative flex flex-1 min-w-0 gap-1 overflow-x-auto scrollbar-none rounded-full mask-fade-x"
      :class="{ 'mask-fade-x-start': canScrollStart, 'mask-fade-x-end': canScrollEnd }"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="shrink-0 min-h-10 px-4 py-2 text-sm font-semibold whitespace-nowrap rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-400"
        :class="
          selected === tab.value
            ? 'bg-slate-900 text-white dark:bg-primary-500 dark:text-slate-900 shadow-soft'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        "
        :aria-pressed="selected === tab.value"
        @click="selected = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Swiping is the main gesture; the chevrons make hidden tabs obvious and give a tap target
         that won't select the half-faded tab under it. Keyboard users reach every tab by Tab key. -->
    <Transition enter-from-class="opacity-0" leave-to-class="opacity-0">
      <button
        v-if="canScrollStart"
        type="button"
        tabindex="-1"
        aria-hidden="true"
        class="absolute inset-y-1 left-1 flex items-center justify-center w-10 rounded-full text-slate-500 dark:text-slate-300 transition-opacity"
        @click="scrollByPage(-1)"
      >
        <ChevronLeft class="w-4 h-4" />
      </button>
    </Transition>
    <Transition enter-from-class="opacity-0" leave-to-class="opacity-0">
      <button
        v-if="canScrollEnd"
        type="button"
        tabindex="-1"
        aria-hidden="true"
        class="absolute inset-y-1 right-1 flex items-center justify-center w-10 rounded-full text-slate-500 dark:text-slate-300 transition-opacity"
        @click="scrollByPage(1)"
      >
        <ChevronRight class="w-4 h-4" />
      </button>
    </Transition>
  </div>
</template>
