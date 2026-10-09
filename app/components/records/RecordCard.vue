<script setup lang="ts">
import { RECORD_KINDS } from '~/constants/records'
import type { FarmRecord, RecordKind, RecordValue } from '~/types/records'

/**
 * Mobile card for one record. The kind's `hero` field is the headline value, its `aside` field a
 * short descriptor opposite it, and the date a small label on top: the date only orders the list,
 * the amount is what people scan for. Remaining listed fields follow as compact details.
 */
const props = defineProps<{
  kind: RecordKind
  record: FarmRecord
}>()

defineEmits<{
  edit: []
  delete: []
}>()

const { t } = useI18n()
const { formatDate } = useLocaleDate()
const { fieldName, formatValue, formatValueWithUnit } = useRecordFormat()

const isEmpty = (value: RecordValue | undefined) => value === undefined || value === null || value === ''
const hasValue = (key: string) => !isEmpty(props.record.values[key])

const listedFields = computed(() => RECORD_KINDS[props.kind].fields.filter((field) => field.isListed))
const heroField = computed(() => listedFields.value.find((field) => field.cardRole === 'hero'))
const asideField = computed(() => listedFields.value.find((field) => field.cardRole === 'aside'))

const hero = computed(() => {
  const field = heroField.value
  if (!field) return null
  const isNumeric = field.type === 'number' || field.type === 'integer'
  return {
    name: fieldName(props.kind, field),
    value: formatValue(field, props.record.values[field.key]),
    // Taka amounts carry the ৳ prefix already; other units sit smaller after the number.
    unit: field.unitKey && field.unitKey !== 'units.taka' ? t(field.unitKey) : null,
    isNumeric,
  }
})

const aside = computed(() => {
  const field = asideField.value
  if (!field || !hasValue(field.key)) return null
  return { name: fieldName(props.kind, field), value: formatValue(field, props.record.values[field.key]) }
})


// Empty optional fields are left out instead of showing a row of dashes.
const details = computed(() =>
  listedFields.value
    .filter((field) => !field.cardRole && field.type !== 'textarea' && hasValue(field.key))
    .map((field) => ({
      key: field.key,
      name: fieldName(props.kind, field),
      value: formatValueWithUnit(field, props.record.values[field.key]),
    })),
)

const notes = computed(() =>
  listedFields.value
    .filter((field) => field.type === 'textarea' && hasValue(field.key))
    .map((field) => ({ key: field.key, name: fieldName(props.kind, field), value: String(props.record.values[field.key]) })),
)
</script>

<template>
  <BaseCard :padded="false" class="p-4">
    <div class="flex items-center justify-between gap-2">
      <time :datetime="record.date" class="text-sm font-medium text-slate-500 dark:text-slate-400">
        {{ formatDate(record.date) }}
      </time>
      <BaseEditDeleteActions class="-mr-2 -my-2" @edit="$emit('edit')" @delete="$emit('delete')" />
    </div>

    <div v-if="hero || aside" class="mt-1 flex items-end justify-between gap-4">
      <p
        v-if="hero"
        class="font-bold text-slate-900 dark:text-white"
        :class="hero.isNumeric ? 'shrink-0 text-3xl tracking-tight' : 'min-w-0 text-xl break-words'"
      >
        <span class="sr-only">{{ hero.name }}: </span>{{ hero.value }}<span
          v-if="hero.unit"
          class="ml-1 text-base font-medium text-slate-500 dark:text-slate-400"
        >{{ hero.unit }}</span>
      </p>
      <p v-if="aside" class="min-w-0 pb-1 text-right text-sm font-semibold text-slate-700 dark:text-slate-200 break-words">
        <span class="sr-only">{{ aside.name }}: </span>{{ aside.value }}
      </p>
    </div>

    <dl v-if="details.length" class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
      <div v-for="detail in details" :key="detail.key" class="flex min-w-0 gap-1">
        <dt class="text-slate-500 dark:text-slate-400">{{ detail.name }}:</dt>
        <dd class="text-slate-800 dark:text-slate-100 break-words">{{ detail.value }}</dd>
      </div>
    </dl>

    <p
      v-for="note in notes"
      :key="note.key"
      class="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 whitespace-pre-line break-words"
    >
      <span class="sr-only">{{ note.name }}: </span>{{ note.value }}
    </p>
  </BaseCard>
</template>
