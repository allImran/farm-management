import type { USER_COLLECTIONS } from '~/constants/collections'
import type { ContactType, IsoDate } from './models'

/** Day-to-day records attached to a farm and (except farm-level expenses) a batch. */
export type RecordKind = keyof Pick<
  typeof USER_COLLECTIONS,
  'expenses' | 'feeds' | 'medicines' | 'mortalities' | 'weights' | 'sales'
>

export type RecordFieldType = 'text' | 'textarea' | 'number' | 'integer' | 'date' | 'select' | 'contact'

export type RecordValue = string | number | null

/** Field values of a record, keyed by field name. Shapes are defined in `constants/records.ts`. */
export type RecordValues = Record<string, RecordValue>

/** Which farm/batch a record list or new record belongs to. `batchId: null` = farm-level. */
export interface RecordScope {
  farmId: string
  batchId: string | null
}

export interface FarmRecord {
  id: string
  farmId: string
  batchId: string | null
  date: IsoDate
  values: RecordValues
  createdAt: Date | null
}

export interface RecordFieldDef {
  key: string
  type: RecordFieldType
  required?: boolean
  /** For `select` fields: stored values; labels come from `options.<optionsKey>.<value>`. */
  options?: readonly string[]
  optionsKey?: string
  /** For `select` fields: options offered instead of `options` on farm-level records (no batch). */
  farmLevelOptions?: readonly string[]
  /** For `contact` fields: only contacts with one of these types are offered. */
  contactTypes?: readonly ContactType[]
  /** i18n key of a unit shown after the label, e.g. `units.kg`. */
  unitKey?: string
  /** Computed from other fields; shown but not editable. */
  isDerived?: boolean
  /** Shown as a column in the record list. */
  isListed?: boolean
}

export interface RecordKindDef {
  kind: RecordKind
  /** Fields besides the shared `date` field. */
  fields: RecordFieldDef[]
  /** Recomputes derived fields from the current form values. */
  derive?: (values: RecordValues) => RecordValues
}
