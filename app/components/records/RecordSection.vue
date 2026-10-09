<script setup lang="ts">
import { Plus } from '@lucide/vue'
import type { RecordKind, RecordScope } from '~/types/records'

/**
 * Everything for one record kind in one scope: list, "Load more", add/edit modal and delete
 * confirmation. Emits `changed` after any write so the parent can refresh its totals.
 */
const props = defineProps<{
  kind: RecordKind
  scope: RecordScope
  title?: string
  /** Short guidance under the title. */
  description?: string
}>()

const emit = defineEmits<{
  changed: []
}>()

const { t } = useI18n()
const scope = () => props.scope

const list = useRecordList(props.kind, scope)
const { items, status, error, isEmpty, hasMore, loadMoreStatus, loadMoreError, loadMore, reset } = list

const handleChanged = () => {
  reset()
  emit('changed')
}

const form = useRecordForm(props.kind, scope, handleChanged)
const { isOpen, values, errors, isEditing, fields } = form
const deletion = useRecordDelete(props.kind, handleChanged)
const { isOpen: isDeleteOpen } = deletion

// Contact names are shown in lists, so load them for kinds that reference contacts.
const contactsStore = useContactsStore()
if (fields.some((field) => field.type === 'contact')) contactsStore.ensureLoaded()
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div class="min-w-0">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ title ?? t(`records.${kind}.title`) }}</h2>
        <p v-if="description" class="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{{ description }}</p>
      </div>
      <BaseButton @click="form.openCreate">
        <template #icon-left><Plus class="w-4 h-4" /></template>
        {{ t('records.add', { name: t(`records.${kind}.singular`) }) }}
      </BaseButton>
    </div>

    <BaseAsyncState
      :status="status"
      :error="error"
      :is-empty="isEmpty"
      :empty-title="t('records.emptyTitle')"
      :empty-description="t(`records.${kind}.empty`)"
      @retry="reset"
    >
      <RecordList :kind="kind" :records="items" @edit="form.openEdit" @delete="deletion.open" />
      <BaseLoadMore :has-more="hasMore" :status="loadMoreStatus" :error="loadMoreError" @load-more="loadMore" />
    </BaseAsyncState>

    <RecordFormModal
      v-model:open="isOpen"
      v-model:values="values"
      :kind="kind"
      :fields="fields"
      :is-editing="isEditing"
      :is-farm-level="props.scope.batchId === null"
      :errors="errors"
      :error="form.error.value"
      :loading="form.isLoading.value"
      @submit="form.handleSubmit"
    />
    <BaseConfirmDialog
      v-model="isDeleteOpen"
      :title="t('records.deleteTitle')"
      :message="t('records.deleteMessage')"
      :confirm-label="t('common.delete')"
      :loading="deletion.isLoading.value"
      :error="deletion.error.value"
      @confirm="deletion.confirm"
    />
  </section>
</template>
