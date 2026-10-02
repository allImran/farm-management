<script setup lang="ts">
import { MapPin, Warehouse } from '@lucide/vue'
import { NuxtLink } from '#components'
import { ROUTES } from '~/constants/routes'
import type { Farm } from '~/types/models'

defineProps<{
  farm: Farm
}>()
</script>

<template>
  <NuxtLink
    :to="ROUTES.farm(farm.id)"
    class="block rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300"
  >
    <BaseCard hover class="h-full">
      <div class="flex items-start gap-3">
        <span class="flex items-center justify-center w-11 h-11 shrink-0 rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
          <Warehouse class="w-5 h-5" />
        </span>
        <div class="min-w-0">
          <h3 class="font-semibold text-slate-900 dark:text-white truncate">{{ farm.name }}</h3>
          <p v-if="farm.location || farm.address" class="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
            <MapPin class="w-3.5 h-3.5 shrink-0" />
            <span class="truncate">{{ farm.location || farm.address }}</span>
          </p>
        </div>
      </div>
    </BaseCard>
  </NuxtLink>
</template>
