<script setup lang="ts">
/** Account page card for changing the password. */
const { t } = useI18n()
const { mustChangePassword } = storeToRefs(useAuthStore())
const { values, errors, error, isLoading, isSaved, handleSubmit } = useChangePasswordForm()
</script>

<template>
  <BaseCard>
    <template #header>
      <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('account.password.title') }}</h2>
    </template>
    <BaseAlert v-if="mustChangePassword" variant="warning" class="mb-4">
      {{ t('account.password.mustChange') }}
    </BaseAlert>
    <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
      <BaseInput
        v-model="values.currentPassword"
        :label="t('account.password.current')"
        :error="errors.currentPassword"
        type="password"
        autocomplete="current-password"
        required
      />
      <BaseInput
        v-model="values.newPassword"
        :label="t('account.password.new')"
        :error="errors.newPassword"
        type="password"
        autocomplete="new-password"
        required
      />
      <BaseInput
        v-model="values.confirmPassword"
        :label="t('auth.fields.confirmPassword')"
        :error="errors.confirmPassword"
        type="password"
        autocomplete="new-password"
        required
      />
      <BaseAlert v-if="error" variant="error">{{ error.message }}</BaseAlert>
      <BaseAlert v-else-if="isSaved" variant="success">{{ t('account.password.saved') }}</BaseAlert>
      <div class="flex justify-end">
        <BaseButton type="submit" :loading="isLoading">{{ t('account.password.submit') }}</BaseButton>
      </div>
    </form>
  </BaseCard>
</template>
