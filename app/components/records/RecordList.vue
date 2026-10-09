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
        <RecordCard :kind="kind" :record="row.record" @edit="$emit('edit', row.record)" @delete="$emit('delete', row.record)" />
      </li>
    </ul>
  </div>
</template>
