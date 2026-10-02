<script setup lang="ts">
const { init } = useTheme()
const localeHead = useLocaleHead()

// Keep <html lang> in sync with the active language for screen readers, fonts and SEO.
useHead(() => ({
  htmlAttrs: { lang: localeHead.value.htmlAttrs.lang },
}))

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
