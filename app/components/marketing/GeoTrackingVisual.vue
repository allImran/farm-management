<script setup lang="ts">
type Point = { id: string; x: number; y: number }

// Coordinates are % of the map; all of these sit inside GEOFENCE.
const HERD: Point[] = [
  { id: 'BD-101', x: 24, y: 34 },
  { id: 'BD-118', x: 33, y: 52 },
  { id: 'BD-124', x: 42, y: 28 },
  { id: 'BD-133', x: 48, y: 63 },
  { id: 'BD-142', x: 56, y: 42 },
  { id: 'BD-150', x: 63, y: 24 },
  { id: 'BD-161', x: 38, y: 74 },
  { id: 'BD-176', x: 20, y: 58 },
  { id: 'BD-188', x: 68, y: 55 },
  { id: 'BD-193', x: 55, y: 79 },
]
const STRAY: Point = { id: 'BD-207', x: 92, y: 80 }
const GEOFENCE = '12,18 70,10 88,40 78,86 30,90 8,60'
const STRAY_TRAIL = `68,62 80,72 ${STRAY.x},${STRAY.y}`

const { t } = useI18n()

const pointStyle = (point: Point, index = 0) => ({
  left: `${point.x}%`,
  top: `${point.y}%`,
  animationDelay: `${-index * 1.3}s`,
})
</script>

<template>
  <figure
    role="img"
    :aria-label="t('cattle.visual.label')"
    class="relative aspect-square w-full overflow-hidden rounded-3xl bg-slate-900 shadow-card ring-1 ring-slate-900/10 sm:aspect-video lg:aspect-square dark:ring-white/10"
  >
    <div class="absolute inset-0 bg-grid-faint bg-grid" aria-hidden="true" />
    <div class="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-accent-green/10 blur-3xl" aria-hidden="true" />

    <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="absolute inset-0 h-full w-full" aria-hidden="true">
      <polygon
        :points="GEOFENCE"
        vector-effect="non-scaling-stroke"
        class="fill-accent-green/10 stroke-accent-green animate-dash motion-reduce:animate-none"
        stroke-width="2"
        stroke-dasharray="8 6"
      />
      <polyline
        :points="STRAY_TRAIL"
        fill="none"
        vector-effect="non-scaling-stroke"
        class="stroke-accent-red"
        stroke-width="2"
        stroke-dasharray="3 5"
        stroke-linecap="round"
      />
    </svg>

    <span
      v-for="(cow, index) in HERD"
      :key="cow.id"
      class="absolute -ml-1.5 -mt-1.5 h-3 w-3 rounded-full bg-accent-green ring-4 ring-accent-green/20 animate-wander motion-reduce:animate-none"
      :style="pointStyle(cow, index)"
      aria-hidden="true"
    />

    <span class="absolute -ml-2 -mt-2 h-4 w-4" :style="pointStyle(STRAY)" aria-hidden="true">
      <span class="absolute inset-0 rounded-full bg-accent-red/60 animate-ping motion-reduce:hidden" />
      <span class="relative block h-4 w-4 rounded-full border-2 border-white bg-accent-red" />
    </span>

    <div
      class="absolute -translate-x-full -translate-y-full pb-3 pr-1"
      :style="pointStyle(STRAY)"
      aria-hidden="true"
    >
      <div class="whitespace-nowrap rounded-2xl border border-red-400/40 bg-slate-950/80 px-4 py-3 text-white shadow-popover backdrop-blur-md">
        <p class="text-xs font-bold text-red-300">{{ t('cattle.visual.outside') }}</p>
        <p class="mt-0.5 text-sm font-bold">{{ t('cattle.visual.cow') }}</p>
        <p class="text-xs text-white/70">{{ t('cattle.visual.lastSeen') }}</p>
      </div>
    </div>

    <div class="absolute inset-x-3 top-3 flex flex-wrap items-center justify-between gap-2 sm:inset-x-5 sm:top-5" aria-hidden="true">
      <span class="rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
        {{ t('cattle.visual.zone') }}
      </span>
      <span class="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
        <span class="h-2 w-2 rounded-full bg-accent-green" />
        {{ t('cattle.visual.online') }}
      </span>
    </div>
  </figure>
</template>
