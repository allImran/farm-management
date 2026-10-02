<script setup lang="ts">
import { TriangleAlert } from '@lucide/vue'

type HeatBody = { id: number; x: number; y: number; size: number; delay: number }
type Marker = { body: HeatBody; temperature: number; isFever: boolean }

const COLUMNS = 9
const ROWS = 5
const FEVER_BODY_ID = 22
// Healthy broilers sit around 40.5–41.5 °C; the flagged bird is clearly above that band.
const FEVER_TEMPERATURE = 42.6
const DETECTED_BIRDS = 1248
const AVERAGE_TEMPERATURE = 40.9

// Birds are laid out on a jittered grid; a fixed seed keeps SSR and client markup identical.
const random = createSeededRandom(7)
const bodies: HeatBody[] = Array.from({ length: COLUMNS * ROWS }, (_, id) => {
  const col = id % COLUMNS
  const row = Math.floor(id / COLUMNS)
  return {
    id,
    x: ((col + 0.5) / COLUMNS) * 100 + (random() - 0.5) * 5,
    y: 10 + ((row + 0.5) / ROWS) * 80 + (random() - 0.5) * 6,
    // The feverish bird reads larger on camera because its heat halo spreads further.
    size: (7 + random() * 3) * (id === FEVER_BODY_ID ? 1.3 : 1),
    delay: -random() * 3.5,
  }
})

const findBody = (id: number) => bodies.find((body) => body.id === id) as HeatBody

const markers: Marker[] = [
  { body: findBody(FEVER_BODY_ID), temperature: FEVER_TEMPERATURE, isFever: true },
  { body: findBody(11), temperature: 40.8, isFever: false },
  { body: findBody(34), temperature: 41.1, isFever: false },
]

const { t } = useI18n()
const { formatNumber } = useLocaleNumber()

const formatTemperature = (value: number) =>
  `${formatNumber(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}°C`

const positionStyle = (body: HeatBody, scale = 1) => ({
  left: `${body.x}%`,
  top: `${body.y}%`,
  width: `${body.size * scale}%`,
})
</script>

<template>
  <figure
    role="img"
    :aria-label="t('hero.visual.label')"
    class="relative aspect-square w-full overflow-hidden rounded-3xl bg-thermal-floor shadow-popover ring-1 ring-slate-900/10 sm:aspect-video dark:ring-white/10"
  >
    <div class="absolute inset-0 bg-grid-faint bg-grid" aria-hidden="true" />

    <span
      v-for="body in bodies"
      :key="body.id"
      class="absolute aspect-square -translate-x-1/2 -translate-y-1/2"
      :style="positionStyle(body)"
      aria-hidden="true"
    >
      <span
        class="block h-full w-full rounded-full animate-breathe motion-reduce:animate-none"
        :class="body.id === FEVER_BODY_ID ? 'bg-thermal-body-hot' : 'bg-thermal-body'"
        :style="{ animationDelay: `${body.delay}s` }"
      />
    </span>

    <div class="absolute inset-x-0 h-1/4 bg-scan-beam animate-scan motion-reduce:hidden" aria-hidden="true" />

    <span
      v-for="marker in markers"
      :key="marker.body.id"
      class="absolute aspect-square -translate-x-1/2 -translate-y-1/2 rounded-lg border-2"
      :class="marker.isFever ? 'border-accent-red shadow-popover' : 'border-white/50'"
      :style="positionStyle(marker.body, 1.1)"
      aria-hidden="true"
    >
      <span
        class="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-bold"
        :class="marker.isFever ? 'bg-accent-red text-white' : 'bg-black/50 text-white'"
      >
        <template v-if="marker.isFever">{{ t('hero.visual.fever') }} · </template>{{ formatTemperature(marker.temperature) }}
      </span>
    </span>

    <div class="absolute left-3 top-3 flex items-center gap-2 sm:left-5 sm:top-5" aria-hidden="true">
      <span class="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
        <span class="h-2 w-2 rounded-full bg-accent-red animate-pulse" />
        {{ t('hero.visual.live') }}
      </span>
      <span class="hidden rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur sm:inline-flex">
        {{ t('hero.visual.camera') }}
      </span>
    </div>

    <div
      class="absolute right-5 top-5 hidden items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur sm:flex"
      aria-hidden="true"
    >
      {{ formatNumber(30) }}°
      <span class="h-2 w-24 rounded-full bg-thermal-scale" />
      {{ formatNumber(44) }}°
    </div>

    <div
      class="absolute inset-x-3 bottom-3 flex flex-col gap-2 sm:inset-x-5 sm:bottom-5 sm:flex-row sm:items-end sm:justify-between"
      aria-hidden="true"
    >
      <div class="hidden gap-6 rounded-2xl border border-white/15 bg-black/30 px-5 py-3 text-white backdrop-blur-md sm:flex">
        <div>
          <p class="text-xs text-white/70">{{ t('hero.visual.detected') }}</p>
          <p class="text-lg font-bold">{{ formatNumber(DETECTED_BIRDS) }}</p>
        </div>
        <div>
          <p class="text-xs text-white/70">{{ t('hero.visual.average') }}</p>
          <p class="text-lg font-bold">{{ formatTemperature(AVERAGE_TEMPERATURE) }}</p>
        </div>
      </div>

      <div class="flex items-center gap-3 rounded-2xl border border-red-400/40 bg-red-500/20 px-4 py-3 text-white backdrop-blur-md animate-slide-in-right">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-red">
          <TriangleAlert class="w-5 h-5" />
        </span>
        <div>
          <p class="text-sm font-bold">{{ t('hero.visual.alertTitle') }} · {{ formatTemperature(FEVER_TEMPERATURE) }}</p>
          <p class="text-xs text-white/80">{{ t('hero.visual.alertBody') }}</p>
        </div>
      </div>
    </div>
  </figure>
</template>
