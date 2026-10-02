<script setup lang="ts">
type Tone = 'default' | 'muted' | 'inverted'

withDefaults(
  defineProps<{
    id?: string
    tone?: Tone
  }>(),
  {
    id: undefined,
    tone: 'default',
  }
)

const TONE_CLASSES: Record<Tone, string> = {
  default: 'bg-white dark:bg-surface-dark',
  muted: 'bg-surface-light dark:bg-surface-dark-elevated/40',
  // Intentionally dark in both themes; the dark theme only shifts it slightly for depth.
  inverted: 'bg-slate-950 text-white dark:bg-surface-dark-elevated',
}
</script>

<template>
  <section :id="id" class="relative overflow-hidden scroll-mt-16 py-20 sm:py-28" :class="TONE_CLASSES[tone]">
    <slot name="background" />
    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <slot />
    </div>
  </section>
</template>
