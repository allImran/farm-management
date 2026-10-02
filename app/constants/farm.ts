/** Enumerations used by farm records. Values are stored in Firestore and checked by the rules. */
export const BATCH_STATUSES = ['active', 'completed', 'cancelled'] as const

export const CONTACT_TYPES = ['supplier', 'customer', 'doctor', 'worker', 'other'] as const

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

export const MEDICINE_TYPES = ['vaccine', 'antibiotic', 'vitamin', 'disinfectant', 'other'] as const

/** Max length of free-text fields; mirrored in `firestore.rules`. */
export const TEXT_LIMITS = {
  short: 100,
  medium: 200,
  note: 1000,
} as const
