<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import { NuxtLink } from '#components'
import { MARKETING_SECTION_IDS } from '~/constants/marketing'
import { ROUTES } from '~/constants/routes'

const { t } = useI18n()
</script>

<template>
  <MarketingSection tone="muted">
    <BaseReveal>
      <div class="relative overflow-hidden rounded-3xl bg-thermal-floor px-6 py-16 text-center shadow-popover sm:px-12 sm:py-24">
        <div class="pointer-events-none absolute inset-0" aria-hidden="true">
          <div class="absolute inset-0 bg-grid-faint bg-grid" />
          <span class="absolute -left-10 top-1/4 w-1/3 aspect-square rounded-full bg-thermal-body opacity-60 blur-2xl animate-breathe" />
          <span
            class="absolute -right-10 bottom-0 w-1/3 aspect-square rounded-full bg-thermal-body opacity-50 blur-2xl animate-breathe"
            style="animation-delay: -1.8s"
          />
        </div>

        <div class="relative mx-auto max-w-2xl">
          <h2 class="text-3xl font-bold leading-tight text-white sm:text-5xl">{{ t('cta.title') }}</h2>
          <p class="mt-5 text-base text-white/80 sm:text-lg">{{ t('cta.description') }}</p>
          <div class="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <BaseButton :as="NuxtLink" :to="ROUTES.signup" size="lg">
              {{ t('cta.primary') }}
              <template #icon-right>
                <ArrowRight class="w-5 h-5" aria-hidden="true" />
              </template>
            </BaseButton>
            <BaseButton as="a" :href="`#${MARKETING_SECTION_IDS.technology}`" variant="glass" size="lg">
              {{ t('cta.secondary') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </BaseReveal>
  </MarketingSection>
</template>
