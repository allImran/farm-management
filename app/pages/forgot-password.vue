<script setup lang="ts">
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
      <BasePhoneInput v-model="values.phone" :label="t('auth.fields.phone')" :error="phoneError" autocomplete="username" required />
      <BaseAlert v-if="error" variant="error">{{ error.message }}</BaseAlert>
      <BaseButton type="submit" size="lg" class="w-full" :loading="status === 'loading'">{{ t('auth.forgot.submit') }}</BaseButton>
    </form>
    <template #footer>
      <BaseLink :to="ROUTES.login">
        {{ t('auth.forgot.backToLogin') }}
      </BaseLink>
    </template>
  </AuthCard>
</template>
