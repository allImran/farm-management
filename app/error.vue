<script setup lang="ts">
import type { NuxtError } from '#app'
import { ROUTES } from '~/constants/routes'

/**
 * Fatal and route errors (an unknown URL, a page that crashed). Failed requests are shown in
 * place by `BaseAsyncState` instead.
 */
const props = defineProps<{
  error: NuxtError
}>()

const { t } = useI18n()
const message = computed(() => t(props.error.statusCode === 404 ? 'errors.notFound' : 'errors.unknown'))

useSeoMeta({ title: () => message.value })

const handleHome = () => clearError({ redirect: ROUTES.home })
</script>

<template>
  <NuxtLayout name="auth">
    <AuthCard :title="message" :subtitle="String(error.statusCode)">
      <BaseButton size="lg" class="w-full" @click="handleHome">{{ t('common.home') }}</BaseButton>
    </AuthCard>
  </NuxtLayout>
</template>
