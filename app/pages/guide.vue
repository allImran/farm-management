<script setup lang="ts">
import { NuxtLink } from '#components'
import { APP_URL } from '~/constants/app'
import { GUIDE_FAQ_ID } from '~/constants/guide'
import { ROUTES } from '~/constants/routes'

const { t } = useI18n()
const { sections, faq, tocLinks } = useGuideContent()
const { activeId } = useScrollSpy(() => tocLinks.value.map((link) => link.id))

useSeoMeta({
  title: () => t('guide.meta.title'),
  description: () => t('guide.meta.description'),
  ogTitle: () => t('guide.meta.title'),
  ogDescription: () => t('guide.meta.description'),
  ogUrl: `${APP_URL}${ROUTES.guide}`,
})
useHead({ link: [{ rel: 'canonical', href: `${APP_URL}${ROUTES.guide}` }] })
</script>

<template>
  <div class="min-h-screen bg-surface-light dark:bg-surface-dark">
    <MarketingHeader />
    <main class="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 sm:pt-32 lg:px-8">
      <MarketingSectionHeading :eyebrow="t('guide.eyebrow')" :title="t('guide.title')" :description="t('guide.subtitle')" align="left" />

      <div class="mt-10 grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14">
        <aside class="lg:sticky lg:top-24 lg:self-start">
          <GuideToc :title="t('guide.toc')" :links="tocLinks" :active-id="activeId" />
        </aside>

        <div class="min-w-0 space-y-16">
          <GuideSection
            v-for="section in sections"
            :id="section.id"
            :key="section.id"
            :icon="section.icon"
            :title="section.title"
            :intro="section.intro"
            :steps="section.steps"
            :tip="section.tip"
            :tip-title="t('guide.tip')"
          />
          <GuideFaq :id="GUIDE_FAQ_ID" :title="t('guide.faq.title')" :items="faq" />

          <BaseCard class="text-center">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ t('guide.cta.title') }}</h2>
            <p class="mt-2 text-slate-600 dark:text-slate-400">{{ t('guide.cta.description') }}</p>
            <div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <BaseButton :as="NuxtLink" :to="ROUTES.signup" size="lg">{{ t('guide.cta.signup') }}</BaseButton>
              <BaseButton :as="NuxtLink" :to="ROUTES.login" variant="outline" size="lg">{{ t('guide.cta.login') }}</BaseButton>
            </div>
          </BaseCard>
        </div>
      </div>
    </main>
    <MarketingFooter />
  </div>
</template>
