<script setup lang="ts">
import { Pencil, Trash2 } from '@lucide/vue'
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
type Row = { id: string; date: string; record: FarmRecord; cells: Record<string, string> }

const rows = computed<Row[]>(() =>
  props.records.map((record) => {
    const cells = Object.fromEntries(listedFields.value.map((field) => [field.key, formatValue(field, record.values[field.key])]))
    return { id: record.id, date: formatDate(record.date), record, cells }
  }),
)
// BaseTable reads cells by column key, so flatten the formatted cells onto each row.
const tableRows = computed(() => rows.value.map((row) => ({ ...row.cells, id: row.id, date: row.date, record: row.record })))
</script>

<template>
  <div>
    <div class="hidden md:block">
      <BaseTable :columns="columns" :rows="tableRows" row-key="id">
        <template #cell-actions="{ row }">
          <div class="flex items-center gap-1">
            <BaseButton variant="ghost" size="icon" :aria-label="t('common.edit')" @click="$emit('edit', row.record as FarmRecord)">
              <Pencil class="w-4 h-4" />
            </BaseButton>
            <BaseButton variant="ghost" size="icon" :aria-label="t('common.delete')" @click="$emit('delete', row.record as FarmRecord)">
              <Trash2 class="w-4 h-4 text-red-500" />
            </BaseButton>
          </div>
        </template>
      </BaseTable>
    </div>

    <ul class="md:hidden space-y-3">
      <li v-for="row in rows" :key="row.id">
        <BaseCard :padded="false" class="p-4">
          <div class="flex items-start justify-between gap-2">
            <p class="font-semibold text-slate-900 dark:text-white">{{ row.date }}</p>
            <div class="flex items-center -mr-2 -mt-1">
              <BaseButton variant="ghost" size="icon" :aria-label="t('common.edit')" @click="$emit('edit', row.record)">
                <Pencil class="w-4 h-4" />
              </BaseButton>
              <BaseButton variant="ghost" size="icon" :aria-label="t('common.delete')" @click="$emit('delete', row.record)">
                <Trash2 class="w-4 h-4 text-red-500" />
              </BaseButton>
            </div>
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
