<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'
import { NuxtLink } from '#components'

/**
 * Title row at the top of an app page. Optional back link, `actions` slot beside the title
 * (primary buttons), `menu` slot pinned top-right on the back-link row (e.g. a "⋮" dropdown) and
 * `meta` slot under the title (e.g. location). Sub-pages (those with `backTo`) get the hero style:
 * a full-width brand gradient behind the header that fades into the page at the bottom.
 */
const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    backTo?: string
    backLabel?: string
  }>(),
  {}
)

const isHero = computed(() => Boolean(props.backTo))

const classes = computed(() =>
  isHero.value
    ? {
        // Bottom padding is the fade zone: the text must end above it to stay on solid colour.
        root: 'relative isolate z-10 mb-2 pb-16 text-slate-900 dark:text-white',
        back: 'text-slate-900/70 hover:text-slate-900 focus-visible:ring-slate-900/30 dark:text-white/75 dark:hover:text-white dark:focus-visible:ring-white/60',
        title: 'text-3xl sm:text-4xl text-slate-900 dark:text-white',
        muted: 'text-slate-900/75 dark:text-white/80',
      }
    : {
        root: 'mb-6',
        back: 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white focus-visible:ring-primary-400',
        title: 'text-2xl sm:text-3xl text-slate-900 dark:text-white',
        muted: 'text-slate-500 dark:text-slate-400',
      }
)
</script>

<template>
  <div :class="classes.root">
    <!--
      Full-bleed backdrop: as wide as the viewport (main's overflow-x-hidden clips it to the content
      column) and pulled up over main's top padding so it meets the app header.
    -->
    <div
      v-if="isHero"
      aria-hidden="true"
      class="pointer-events-none absolute -z-10 left-1/2 -translate-x-1/2 w-screen -top-4 sm:-top-6 lg:-top-8 bottom-0 bg-hero dark:bg-hero-dark mask-fade-b"
    />
    <div v-if="backTo || $slots.menu" class="flex items-center justify-between gap-3 mb-3">
      <NuxtLink
        v-if="backTo"
        :to="backTo"
        class="inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold focus:outline-none focus-visible:ring-2"
        :class="classes.back"
      >
        <ArrowLeft class="w-4 h-4" />
        {{ backLabel ?? $t('common.back') }}
      </NuxtLink>
      <div v-if="$slots.menu" class="ml-auto -my-2 -mr-2">
        <slot name="menu" />
      </div>
    </div>
    <div class="flex flex-wrap items-start justify-between gap-x-3 gap-y-4">
      <div class="grow min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <h1 class="font-bold break-words" :class="classes.title">{{ title }}</h1>
          <slot name="badge" />
        </div>
        <p v-if="description" class="mt-1" :class="classes.muted">{{ description }}</p>
        <div v-if="$slots.meta" class="mt-2 text-sm" :class="classes.muted">
          <slot name="meta" />
        </div>
      </div>
      <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
