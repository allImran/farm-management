<script setup lang="ts">
import { Plus, Users } from '@lucide/vue'
import { CONTACT_TYPES } from '~/constants/farm'

definePageMeta({ layout: 'app', middleware: 'auth' })

const { t } = useI18n()

const { active: typeFilter, tabs, selected: selectedType } = useQueryFilter('type', CONTACT_TYPES, (value) =>
  t(`options.contactTypes.${value}`),
)

const { items, status, error, isEmpty, hasMore, loadMoreStatus, loadMoreError, loadMore, reset } = useContactList(
  () => selectedType.value,
)
const form = useContactForm(reset)
const deletion = useContactDelete(reset)
const { isOpen, values, errors } = form
const { isOpen: isDeleteOpen } = deletion

useSeoMeta({ title: () => t('contacts.title') })
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <PageHeader :title="t('contacts.title')" :description="t('contacts.description')">
      <template #actions>
        <BaseButton @click="form.openCreate">
          <template #icon-left><Plus class="w-4 h-4" /></template>
          {{ t('contacts.add') }}
        </BaseButton>
      </template>
    </PageHeader>

    <BaseTabs v-model="typeFilter" :tabs="tabs" class="mb-5" />

    <BaseAsyncState
      :status="status"
      :error="error"
      :is-empty="isEmpty"
      :empty-title="t('contacts.emptyTitle')"
      :empty-description="t('contacts.emptyDescription')"
      @retry="reset"
    >
      <template #empty-icon><Users class="w-7 h-7" /></template>
      <ul class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <li v-for="contact in items" :key="contact.id">
          <ContactCard :contact="contact" @edit="form.openEdit(contact)" @delete="deletion.open(contact)" />
        </li>
      </ul>
      <BaseLoadMore :has-more="hasMore" :status="loadMoreStatus" :error="loadMoreError" @load-more="loadMore" />
    </BaseAsyncState>

    <ContactFormModal
      v-model:open="isOpen"
      v-model:values="values"
      :is-editing="form.isEditing.value"
      :errors="errors"
      :error="form.error.value"
      :loading="form.isLoading.value"
      @submit="form.handleSubmit"
    />
    <BaseConfirmDialog
      v-model="isDeleteOpen"
      :title="t('contacts.deleteTitle')"
      :message="t('contacts.deleteMessage', { name: deletion.target.value?.name ?? '' })"
      :confirm-label="t('common.delete')"
      :loading="deletion.isLoading.value"
      :error="deletion.error.value"
      @confirm="deletion.confirm"
    />
  </div>
</template>
