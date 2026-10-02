import { TEXT_LIMITS } from '~/constants/farm'
import { RECORD_KINDS } from '~/constants/records'
import { createRecord, deleteRecord, fetchRecordsPage, updateRecord } from '~/services/records.service'
import type { FarmRecord, RecordFieldDef, RecordKind, RecordScope, RecordValues } from '~/types/records'
import { todayIsoDate } from '~/utils/date'

/** Form values are kept as strings (what inputs emit) and converted on save. */
export type RecordFormValues = Record<string, string>

const NUMERIC_TYPES = new Set<RecordFieldDef['type']>(['number', 'integer'])

/** Converts form strings to stored values: numbers for numeric fields, `null` for blanks. */
const toStoredValues = (fields: RecordFieldDef[], form: RecordFormValues): RecordValues => {
  const stored: RecordValues = {}
  for (const field of fields) {
    const raw = (form[field.key] ?? '').trim()
    stored[field.key] = raw === '' ? null : NUMERIC_TYPES.has(field.type) ? Number(raw) : raw
  }
  return stored
}

const toFormValues = (fields: RecordFieldDef[], values: RecordValues): RecordFormValues =>
  Object.fromEntries(fields.map((field) => [field.key, values[field.key] == null ? '' : String(values[field.key])]))

/**
 * Paginated records of one kind for a farm/batch ("Load more"), newest first.
 *
 * @param scope getter for the farm/batch; changing it reloads from page one.
 */
export const useRecordList = (kind: RecordKind, scope: () => RecordScope) => {
  const uid = useSessionUid()
  const list = usePagination((page) => fetchRecordsPage(uid(), kind, scope(), page))
  watch(scope, () => list.reset(), { immediate: true, deep: true })
  return list
}

/**
 * Create/edit form for any record kind, driven by its field definitions.
 * Derived fields (e.g. sale total) are recalculated as the user types.
 */
export const useRecordForm = (kind: RecordKind, scope: () => RecordScope, onSaved?: () => void) => {
  const uid = useSessionUid()
  const validators = useValidators()
  const definition = RECORD_KINDS[kind]

  const validateField = (field: RecordFieldDef, value: string) => {
    if (field.isDerived) return undefined
    if (field.type === 'number') return validators.number(value, { required: field.required, min: 0 })
    if (field.type === 'integer') return validators.number(value, { required: field.required, min: 1, isInteger: true })
    const max = field.type === 'textarea' ? TEXT_LIMITS.note : TEXT_LIMITS.short
    return validators.text(value, { required: field.required, max })
  }

  const form = useEntityForm<RecordFormValues, FarmRecord>({
    empty: () => ({ date: todayIsoDate(), ...Object.fromEntries(definition.fields.map((field) => [field.key, ''])) }),
    fromEntity: (record) => ({ date: record.date, ...toFormValues(definition.fields, record.values) }),
    validate: (values) => ({
      date: validators.date(values.date),
      ...Object.fromEntries(definition.fields.map((field) => [field.key, validateField(field, values[field.key] ?? '')])),
    }),
    save: (values, editing) => {
      const stored = toStoredValues(definition.fields, values)
      const input = { date: values.date ?? todayIsoDate(), values: { ...stored, ...definition.derive?.(stored) } }
      return editing ? updateRecord(uid(), kind, editing.id, input) : createRecord(uid(), kind, scope(), input)
    },
    onSaved,
  })

  if (definition.derive) {
    watch(
      form.values,
      (values) => {
        const derived = definition.derive!(toStoredValues(definition.fields, values))
        for (const [key, value] of Object.entries(derived)) {
          const next = value == null ? '' : String(value)
          if (values[key] !== next) values[key] = next
        }
      },
      { deep: true },
    )
  }

  return { ...form, fields: definition.fields }
}

export const useRecordDelete = (kind: RecordKind, onDeleted?: () => void) => {
  const uid = useSessionUid()
  return useDeleteAction<FarmRecord>({
    remove: (record) => deleteRecord(uid(), kind, record.id),
    onDeleted,
  })
}
