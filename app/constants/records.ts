import type { RecordKind, RecordKindDef, RecordValues } from '~/types/records'
import { EXPENSE_TYPES, MEDICINE_TYPES } from './farm'

const toAmount = (value: RecordValues[string] | undefined) => (typeof value === 'number' ? value : Number(value) || 0)

/**
 * Field definitions for every record kind. One generic list + form renders all of them, so a
 * new field only needs adding here, in the i18n files and in `firestore.rules`.
 * Every kind also has a required `date` field and an optional `note` (`notes` for contacts).
 */
export const RECORD_KINDS: Record<RecordKind, RecordKindDef> = {
  expenses: {
    kind: 'expenses',
    fields: [
      { key: 'type', type: 'select', required: true, options: EXPENSE_TYPES, optionsKey: 'expenseTypes', isListed: true },
      { key: 'amount', type: 'number', required: true, unitKey: 'units.taka', isListed: true },
      { key: 'contactId', type: 'contact', isListed: true },
      { key: 'note', type: 'textarea' },
    ],
  },
  feeds: {
    kind: 'feeds',
    fields: [
      { key: 'consumption', type: 'number', required: true, unitKey: 'units.kg', isListed: true },
      { key: 'note', type: 'textarea', isListed: true },
    ],
  },
  medicines: {
    kind: 'medicines',
    fields: [
      { key: 'name', type: 'text', required: true, isListed: true },
      { key: 'type', type: 'select', required: true, options: MEDICINE_TYPES, optionsKey: 'medicineTypes', isListed: true },
      { key: 'disease', type: 'text', isListed: true },
      { key: 'quantity', type: 'text', required: true, isListed: true },
      { key: 'note', type: 'textarea' },
    ],
  },
  mortalities: {
    kind: 'mortalities',
    fields: [
      { key: 'count', type: 'integer', required: true, unitKey: 'units.birds', isListed: true },
      { key: 'cause', type: 'text', isListed: true },
      { key: 'note', type: 'textarea' },
    ],
  },
  weights: {
    kind: 'weights',
    fields: [
      { key: 'averageWeight', type: 'number', required: true, unitKey: 'units.gram', isListed: true },
      { key: 'sampleSize', type: 'integer', unitKey: 'units.birds', isListed: true },
      { key: 'note', type: 'textarea' },
    ],
  },
  sales: {
    kind: 'sales',
    fields: [
      { key: 'quantity', type: 'integer', required: true, unitKey: 'units.birds', isListed: true },
      { key: 'weight', type: 'number', required: true, unitKey: 'units.kg', isListed: true },
      { key: 'unitPrice', type: 'number', required: true, unitKey: 'units.takaPerKg' },
      { key: 'totalAmount', type: 'number', unitKey: 'units.taka', isDerived: true, isListed: true },
      { key: 'contactId', type: 'contact', isListed: true },
      { key: 'note', type: 'textarea' },
    ],
    // Broilers are sold by live weight, so the total is weight (kg) × price per kg.
    derive: (values) => ({
      totalAmount: Math.round(toAmount(values.weight) * toAmount(values.unitPrice) * 100) / 100,
    }),
  },
}

/** Record kinds shown as tabs on the batch page, in order. */
export const BATCH_RECORD_KINDS: RecordKind[] = ['feeds', 'mortalities', 'weights', 'medicines', 'expenses', 'sales']
