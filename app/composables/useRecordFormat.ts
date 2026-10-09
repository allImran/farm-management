import type { RecordFieldDef, RecordKind, RecordValue } from '~/types/records'

/**
 * Labels and display values for record fields, shared by the record list and form.
 *
 * @returns `fieldName(kind, field)`, `fieldLabel(kind, field)` (name with unit), `formatValue(field, value)`
 *          and `formatValueWithUnit(field, value)` (value with unit, for places without a labelled column).
 */
export const useRecordFormat = () => {
  const { t } = useI18n()
  const { formatNumber, formatMoney } = useLocaleNumber()
  const { byId } = storeToRefs(useContactsStore())

  const fieldName = (kind: RecordKind, field: RecordFieldDef) => t(`records.${kind}.fields.${field.key}`)

  const fieldLabel = (kind: RecordKind, field: RecordFieldDef) => {
    const name = fieldName(kind, field)
    return field.unitKey ? `${name} (${t(field.unitKey)})` : name
  }

  const formatValue = (field: RecordFieldDef, value: RecordValue | undefined) => {
    if (value === null || value === undefined || value === '') return '—'
    if (field.type === 'select') return t(`options.${field.optionsKey}.${value}`)
    if (field.type === 'contact') return byId.value.get(String(value))?.name ?? t('contacts.unknown')
    if (typeof value === 'number') {
      return field.unitKey === 'units.taka' ? formatMoney(value) : formatNumber(value, { maximumFractionDigits: 2 })
    }
    return String(value)
  }

  // Taka amounts already carry the ৳ prefix from formatMoney, so they get no unit suffix.
  const formatValueWithUnit = (field: RecordFieldDef, value: RecordValue | undefined) => {
    const formatted = formatValue(field, value)
    if (formatted === '—' || !field.unitKey || field.unitKey === 'units.taka') return formatted
    return `${formatted} ${t(field.unitKey)}`
  }

  return { fieldName, fieldLabel, formatValue, formatValueWithUnit }
}
