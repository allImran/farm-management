<script setup lang="ts">
import { Lock, Mail, Phone, UserRound } from '@lucide/vue'
import { NuxtLink } from '#components'
import { ROUTES } from '~/constants/routes'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const { t } = useI18n()
const route = useRoute()
const { values, errors, error, isSubmitting, isCompletingProfile, handleSubmit } = useSignupForm()

const title = computed(() => (isCompletingProfile.value ? t('auth.signup.completeTitle') : t('auth.signup.title')))

useSeoMeta({ title: () => title.value })
</script>

<template>
  <AuthCard :title="title" :subtitle="t('auth.signup.subtitle')">
    <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
      <BaseInput v-model="values.name" :label="t('auth.fields.name')" :error="errors.name" autocomplete="name" required>
        <template #icon-left><UserRound class="w-4 h-4" /></template>
      </BaseInput>
      <BaseInput
        v-model="values.phone"
        :label="t('auth.fields.phone')"
        :hint="t('auth.signup.phoneHint')"
        :error="errors.phone"
        :readonly="isCompletingProfile"
        type="tel"
        inputmode="tel"
        autocomplete="username"
        placeholder="01XXXXXXXXX"
        required
      >
        <template #icon-left><Phone class="w-4 h-4" /></template>
      </BaseInput>
      <BaseInput
        v-model="values.email"
        :label="`${t('auth.fields.email')} (${t('common.optional')})`"
        :error="errors.email"
        type="email"
        inputmode="email"
        autocomplete="email"
      >
        <template #icon-left><Mail class="w-4 h-4" /></template>
      </BaseInput>
      <template v-if="!isCompletingProfile">
        <BaseInput
          v-model="values.password"
          :label="t('auth.fields.password')"
          :error="errors.password"
          type="password"
          autocomplete="new-password"
          required
        >
          <template #icon-left><Lock class="w-4 h-4" /></template>
        </BaseInput>
        <BaseInput
          v-model="values.confirmPassword"
          :label="t('auth.fields.confirmPassword')"
          :error="errors.confirmPassword"
          type="password"
          autocomplete="new-password"
          required
        >
          <template #icon-left><Lock class="w-4 h-4" /></template>
        </BaseInput>
      </template>
      <BaseAlert v-if="error" variant="error">{{ error.message }}</BaseAlert>
      <BaseButton type="submit" size="lg" class="w-full" :loading="isSubmitting">
        {{ isCompletingProfile ? t('common.save') : t('auth.signup.submit') }}
      </BaseButton>
    </form>
    <template v-if="!isCompletingProfile" #footer>
      {{ t('auth.signup.haveAccount') }}
      <NuxtLink :to="{ path: ROUTES.login, query: route.query }" class="font-semibold text-primary-700 dark:text-primary-400 hover:underline">
        {{ t('auth.signup.loginLink') }}
      </NuxtLink>
    </template>
  </AuthCard>
</template>
