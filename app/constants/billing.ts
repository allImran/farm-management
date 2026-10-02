/** Months of write access granted when the admin approves a request without changing anything. */
export const DEFAULT_GRANT_MONTHS = 1
export const MAX_GRANT_MONTHS = 36

/** Users identify their bKash payment by the last digits of the number they paid from. */
export const BKASH_DIGITS_LENGTH = 4

/** Show a renewal reminder when write access ends within this many days. */
export const EXPIRY_WARNING_DAYS = 5

export const SUBSCRIPTION_TYPES = ['lifetime', 'period'] as const
export const PAYMENT_REQUEST_STATUSES = ['pending', 'approved', 'rejected'] as const
