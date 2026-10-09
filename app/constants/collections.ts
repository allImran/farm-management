/**
 * Firestore collection names. Keep in sync with `firestore.rules` and `firestore.indexes.json`.
 *
 * Farm data lives in per-user subcollections (`users/{uid}/farms`, ...) so ownership is part of
 * the document path and the rules can enforce it without extra reads.
 */
export const COLLECTIONS = {
  users: 'users',
  /** `admins/{uid}` docs are created by hand in the Firebase console; clients can only read their own. */
  admins: 'admins',
  /** `subscriptions/{uid}`: write access granted by the admin. */
  subscriptions: 'subscriptions',
  paymentRequests: 'paymentRequests',
  /** `passwordResetRequests/{phone}`: written by signed-out users, approved by the admin. */
  passwordResetRequests: 'passwordResetRequests',
  config: 'config',
} as const

/** Subcollections under `users/{uid}`. */
export const USER_COLLECTIONS = {
  farms: 'farms',
  batches: 'batches',
  contacts: 'contacts',
  expenses: 'expenses',
  feeds: 'feeds',
  medicines: 'medicines',
  mortalities: 'mortalities',
  weights: 'weights',
  sales: 'sales',
} as const

/** Document ids inside the `config` collection. */
export const CONFIG_DOCS = {
  plan: 'plan',
} as const
