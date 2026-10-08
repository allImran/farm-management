<script setup lang="ts">
import { APP_NAME, APP_OG_IMAGE } from '~/constants/app'

const { init } = useTheme()
const { t } = useI18n()
const localeHead = useLocaleHead()

// Keep <html lang> in sync with the active language for screen readers, fonts and SEO.
// Page titles get the brand appended unless they already contain it (the home page does).
useHead(() => ({
  htmlAttrs: { lang: localeHead.value.htmlAttrs.lang },
  titleTemplate: (title?: string) => (!title || title.includes(APP_NAME) ? title || APP_NAME : `${title} · ${APP_NAME}`),
}))

// Site-wide defaults for search and link previews; pages override title/description.
useSeoMeta({
  description: () => t('meta.description'),
  ogSiteName: APP_NAME,
  ogType: 'website',
  ogTitle: () => t('meta.title'),
  ogDescription: () => t('meta.description'),
  ogImage: APP_OG_IMAGE,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: APP_NAME,
  ogLocale: () => localeHead.value.htmlAttrs.lang?.replace('-', '_'),
  twitterCard: 'summary_large_image',
  twitterImage: APP_OG_IMAGE,
})

onMounted(() => {
  init()
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
