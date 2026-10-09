<script setup lang="ts">
import { APP_URL } from '~/constants/app'

// The marketing header is `position: fixed`, so this page fades without sliding (see main.css).
definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

const { t } = useI18n()

// Description and social tags come from the site-wide defaults in app.vue.
useSeoMeta({
  title: () => t('meta.title'),
  ogUrl: `${APP_URL}/`,
})
useHead({ link: [{ rel: 'canonical', href: `${APP_URL}/` }] })
</script>

<template>
  <div class="min-h-screen">
    <MarketingHeader />
    <main>
      <MarketingHero />
      <MarketingTechnology />
      <MarketingPoultry />
      <MarketingCattle />
      <MarketingImpact />
      <MarketingSteps />
      <MarketingCta />
    </main>
    <MarketingFooter />
  </div>
</template>
