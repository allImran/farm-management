<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('meta.title'),
  description: () => t('meta.description'),
  ogTitle: () => t('meta.title'),
  ogDescription: () => t('meta.description'),
})
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
