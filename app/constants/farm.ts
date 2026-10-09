/** Enumerations used by farm records. Values are stored in Firestore and checked by the rules. */
export const BATCH_STATUSES = ['active', 'completed', 'cancelled'] as const

export const CONTACT_TYPES = ['supplier', 'customer', 'doctor', 'worker', 'other'] as const

/** Running costs of a batch. */
export const EXPENSE_TYPES = [
  'chicks',
  'feed',
  'medicine',
  'labor',
  'electricity',
  'transport',
  'litter',
  'equipment',
  'rent',
  'other',
] as const

/**
 * Farm-level expenses (no batch): setting up and keeping the shed between batches. Day-to-day
 * costs like chicks and feed belong to a batch, so they aren't offered here.
 */
export const FARM_EXPENSE_TYPES = [
  'construction',
  'equipment',
  'electrical',
  'water',
  'cleaning',
  'electricity',
  'labor',
  'rent',
  'fees',
  'other',
] as const

/** Every stored expense category, batch list first; mirrored in `firestore.rules`. */
export const ALL_EXPENSE_TYPES = [...new Set([...EXPENSE_TYPES, ...FARM_EXPENSE_TYPES])] as Array<
  (typeof EXPENSE_TYPES)[number] | (typeof FARM_EXPENSE_TYPES)[number]
>

export const MEDICINE_TYPES = ['vaccine', 'antibiotic', 'vitamin', 'disinfectant', 'other'] as const

/** Max length of free-text fields; mirrored in `firestore.rules`. */
export const TEXT_LIMITS = {
  short: 100,
  medium: 200,
  note: 1000,
} as const
