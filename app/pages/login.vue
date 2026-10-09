<script setup lang="ts">
import { Lock } from '@lucide/vue'
import { ROUTES } from '~/constants/routes'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const { t } = useI18n()
const route = useRoute()
const { values, errors, error, isLoading, handleSubmit } = useLoginForm()

useSeoMeta({ title: () => t('auth.login.title') })
</script>

<template>
  <AuthCard :title="t('auth.login.title')" :subtitle="t('auth.login.subtitle')">
    <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
      <BasePhoneInput v-model="values.phone" :label="t('auth.fields.phone')" :error="errors.phone" autocomplete="username" required />
      <BaseInput
        v-model="values.password"
        :label="t('auth.fields.password')"
        :error="errors.password"
        type="password"
        autocomplete="current-password"
        required
      >
        <template #icon-left><Lock class="w-4 h-4" /></template>
      </BaseInput>
      <BaseAlert v-if="error" variant="error">{{ error.message }}</BaseAlert>
      <BaseButton type="submit" size="lg" class="w-full" :loading="isLoading">{{ t('auth.login.submit') }}</BaseButton>
      <p class="text-sm text-center">
        <BaseLink :to="ROUTES.forgotPassword">
          {{ t('auth.login.forgot') }}
        </BaseLink>
      </p>
    </form>
    <template #footer>
      {{ t('auth.login.noAccount') }}
      <BaseLink :to="{ path: ROUTES.signup, query: route.query }">
        {{ t('auth.login.signupLink') }}
      </BaseLink>
    </template>
  </AuthCard>
</template>
