<script setup lang="ts">
import { CircleCheck } from '@lucide/vue'

type Tone = 'default' | 'muted'

withDefaults(
  defineProps<{
    id: string
    eyebrow: string
    title: string
    description: string
    points: string[]
    /** Put the visual on the left on large screens, to alternate consecutive features. */
    isReversed?: boolean
    tone?: Tone
  }>(),
  {
    isReversed: false,
    tone: 'default',
  }
)
</script>

<template>
  <MarketingSection :id="id" :tone="tone">
    <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
      <BaseReveal :class="isReversed ? 'lg:order-2' : ''">
        <MarketingSectionHeading :eyebrow="eyebrow" :title="title" :description="description" align="left" />
        <ul class="mt-8 space-y-4">
          <li v-for="point in points" :key="point" class="flex items-start gap-3">
            <CircleCheck class="mt-0.5 w-6 h-6 shrink-0 text-accent-green" aria-hidden="true" />
            <span class="text-base text-slate-700 dark:text-slate-300">{{ point }}</span>
          </li>
        </ul>
      </BaseReveal>
      <BaseReveal :delay="150">
        <slot name="visual" />
      </BaseReveal>
    </div>
  </MarketingSection>
</template>
