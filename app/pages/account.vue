<script setup lang="ts">
definePageMeta({ layout: 'app', middleware: 'auth' })

const { t } = useI18n()

useSeoMeta({ title: () => t('account.title') })
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <PageHeader :title="t('account.title')" />
    <SubscriptionCard />
    <ProfileCard />
    <ChangePasswordCard />
  </div>
</template>
