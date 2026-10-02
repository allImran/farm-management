import type { RecordFieldDef, RecordKind, RecordValue } from '~/types/records'

/**
 * Labels and display values for record fields, shared by the record list and form.
 *
 * @returns `fieldLabel(kind, field)` (with unit) and `formatValue(field, value)`.
 */
export const useRecordFormat = () => {
  const { t } = useI18n()
  const { formatNumber, formatMoney } = useLocaleNumber()
  const { byId } = storeToRefs(useContactsStore())

  const fieldLabel = (kind: RecordKind, field: RecordFieldDef) => {
    const label = t(`records.${kind}.fields.${field.key}`)
    return field.unitKey ? `${label} (${t(field.unitKey)})` : label
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

  return { fieldLabel, formatValue }
}
