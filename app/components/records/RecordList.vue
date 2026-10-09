<script setup lang="ts">
import { RECORD_KINDS } from '~/constants/records'
import type { FarmRecord, RecordKind } from '~/types/records'

/** Records as a table on desktop and as cards on small screens. */
const props = defineProps<{
  kind: RecordKind
  records: FarmRecord[]
}>()

defineEmits<{
  edit: [record: FarmRecord]
  delete: [record: FarmRecord]
}>()

const { t } = useI18n()
const { formatDate } = useLocaleDate()
const { fieldLabel, formatValue } = useRecordFormat()

const listedFields = computed(() => RECORD_KINDS[props.kind].fields.filter((field) => field.isListed))
const columns = computed(() => [
  { key: 'date', label: t('common.date') },
  ...listedFields.value.map((field) => ({ key: field.key, label: fieldLabel(props.kind, field) })),
  { key: 'actions', label: t('common.actions') },
])

/** Each record with its display values, formatted once for both layouts. */
const rows = computed(() =>
  props.records.map((record) => ({
    id: record.id,
    record,
    date: formatDate(record.date),
    cells: Object.fromEntries(listedFields.value.map((field) => [field.key, formatValue(field, record.values[field.key])])),
  })),
)
</script>

<template>
  <div>
    <div class="hidden md:block">
      <BaseTable :columns="columns" :rows="rows" row-key="id">
        <template v-for="field in listedFields" :key="field.key" #[`cell-${field.key}`]="{ row }">
          {{ row.cells[field.key] }}
        </template>
        <template #cell-actions="{ row }">
          <BaseEditDeleteActions @edit="$emit('edit', row.record)" @delete="$emit('delete', row.record)" />
        </template>
      </BaseTable>
    </div>

    <ul class="md:hidden space-y-3">
      <li v-for="row in rows" :key="row.id">
        <BaseCard :padded="false" class="p-4">
          <div class="flex items-start justify-between gap-2">
            <p class="font-semibold text-slate-900 dark:text-white">{{ row.date }}</p>
            <BaseEditDeleteActions class="-mr-2 -mt-1" @edit="$emit('edit', row.record)" @delete="$emit('delete', row.record)" />
          </div>
          <dl class="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div v-for="field in listedFields" :key="field.key" class="min-w-0">
              <dt class="text-xs text-slate-500 dark:text-slate-400">{{ fieldLabel(kind, field) }}</dt>
              <dd class="text-slate-800 dark:text-slate-100 break-words">{{ row.cells[field.key] }}</dd>
            </div>
          </dl>
        </BaseCard>
      </li>
    </ul>
  </div>
</template>
