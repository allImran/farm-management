<script setup lang="ts">
/**
 * One full-width band of a page, used to split pages with several sections (dashboard, farm and
 * batch details) into clearly separated parts. Alternate `tone` between neighbours: `base` sits on
 * the page background, `raised` draws a contrasting band with hairline borders.
 *
 * `first` drops the top padding (the PageHeader above already spaces it). `last` drops the bottom
 * padding of a `base` band (main's own padding closes the page), or stretches a `raised` band down
 * over main's bottom padding so it meets the page edge.
 */
const props = withDefaults(
  defineProps<{
    tone?: 'base' | 'raised'
    first?: boolean
    last?: boolean
  }>(),
  {
    tone: 'base',
    first: false,
    last: false,
  }
)

const isRaised = computed(() => props.tone === 'raised')

const rootClass = computed(() => [
  'relative isolate',
  props.first && !isRaised.value ? '' : 'pt-10 sm:pt-12',
  props.last && !isRaised.value ? '' : 'pb-10 sm:pb-12',
])

// Offsets mirror main's padding (p-4 sm:p-6 lg:p-8) in AppShell.
const bandClass = computed(() => (props.last ? '-bottom-4 sm:-bottom-6 lg:-bottom-8' : 'bottom-0'))
</script>

<template>
  <div :class="rootClass">
    <!--
      Full-bleed band, same trick as PageHeader's hero: as wide as the viewport and clipped to the
      content column by main's overflow-x-hidden, so it spans main's side padding too.
    -->
    <div
      v-if="isRaised"
      aria-hidden="true"
      class="pointer-events-none absolute -z-10 top-0 left-1/2 -translate-x-1/2 w-screen bg-white border-t border-slate-200 dark:bg-surface-dark-elevated/50 dark:border-slate-800"
      :class="[bandClass, last ? '' : 'border-b']"
    />
    <slot />
  </div>
</template>
