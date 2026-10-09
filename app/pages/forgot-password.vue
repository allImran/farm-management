<script setup lang="ts">
import { Phone } from '@lucide/vue'
import { NuxtLink } from '#components'
import { ROUTES } from '~/constants/routes'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const { t } = useI18n()
const { values, phoneError, status, error, handleSubmit } = useForgotPasswordForm()

useSeoMeta({ title: () => t('auth.forgot.title') })
</script>

<template>
  <AuthCard :title="t('auth.forgot.title')" :subtitle="t('auth.forgot.subtitle')">
    <BaseAlert v-if="status === 'success'" variant="success" :title="t('auth.forgot.sentTitle')">
      {{ t('auth.forgot.sent') }}
    </BaseAlert>
    <form v-else class="space-y-4" novalidate @submit.prevent="handleSubmit">
      <BaseInput
        v-model="values.phone"
        :label="t('auth.fields.phone')"
        :error="phoneError"
        type="tel"
        inputmode="tel"
        autocomplete="username"
        placeholder="01XXXXXXXXX"
        required
      >
        <template #icon-left><Phone class="w-4 h-4" /></template>
      </BaseInput>
      <BaseAlert v-if="error" variant="error">{{ error.message }}</BaseAlert>
      <BaseButton type="submit" size="lg" class="w-full" :loading="status === 'loading'">{{ t('auth.forgot.submit') }}</BaseButton>
    </form>
    <template #footer>
      <NuxtLink :to="ROUTES.login" class="font-semibold text-primary-700 dark:text-primary-400 hover:underline">
        {{ t('auth.forgot.backToLogin') }}
      </NuxtLink>
    </template>
  </AuthCard>
</template>
