<script setup lang="ts">
import { Lock, Phone } from '@lucide/vue'
import { NuxtLink } from '#components'
import { ROUTES } from '~/constants/routes'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const { t } = useI18n()
const route = useRoute()
const { values, errors, error, isSubmitting, handleSubmit } = useLoginForm()

useSeoMeta({ title: () => t('auth.login.title') })
</script>

<template>
  <AuthCard :title="t('auth.login.title')" :subtitle="t('auth.login.subtitle')">
    <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
      <BaseInput
        v-model="values.phone"
        :label="t('auth.fields.phone')"
        :error="errors.phone"
        type="tel"
        inputmode="tel"
        autocomplete="username"
        placeholder="01XXXXXXXXX"
        required
      >
        <template #icon-left><Phone class="w-4 h-4" /></template>
      </BaseInput>
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
      <BaseButton type="submit" size="lg" class="w-full" :loading="isSubmitting">{{ t('auth.login.submit') }}</BaseButton>
      <p class="text-sm text-center">
        <NuxtLink :to="ROUTES.forgotPassword" class="font-semibold text-primary-700 dark:text-primary-400 hover:underline">
          {{ t('auth.login.forgot') }}
        </NuxtLink>
      </p>
    </form>
    <template #footer>
      {{ t('auth.login.noAccount') }}
      <NuxtLink :to="{ path: ROUTES.signup, query: route.query }" class="font-semibold text-primary-700 dark:text-primary-400 hover:underline">
        {{ t('auth.login.signupLink') }}
      </NuxtLink>
    </template>
  </AuthCard>
</template>
