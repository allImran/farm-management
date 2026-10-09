<script setup lang="ts">
/** Account page card for editing the name and email; the phone number is shown read-only. */
const { t } = useI18n()
const { values, errors, error, isLoading, isSaved, phone, handleSubmit } = useProfileForm()
</script>

<template>
  <BaseCard>
    <template #header>
      <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('account.profile') }}</h2>
    </template>
    <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
      <BaseInput v-model="values.name" :label="t('auth.fields.name')" :error="errors.name" autocomplete="name" required />
      <BaseInput :model-value="phone" :label="t('auth.fields.phone')" :hint="t('account.phoneHint')" readonly />
      <BaseInput v-model="values.email" :label="t('auth.fields.email')" optional :error="errors.email" type="email" autocomplete="email" />
      <BaseAlert v-if="error" variant="error">{{ error.message }}</BaseAlert>
      <BaseAlert v-else-if="isSaved" variant="success">{{ t('account.saved') }}</BaseAlert>
      <div class="flex justify-end">
        <BaseButton type="submit" :loading="isLoading">{{ t('common.save') }}</BaseButton>
      </div>
    </form>
  </BaseCard>
</template>
