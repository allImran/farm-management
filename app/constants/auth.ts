/**
 * Accounts sign in with phone + password and no SMS verification. Firebase Auth has no
 * "phone + password" provider, so each phone number is mapped to a synthetic email on this
 * domain and stored with the email/password provider. The domain is also hard-coded in
 * `firestore.rules`, which use it to bind a profile's phone number to the signed-in account.
 */
export const PHONE_AUTH_EMAIL_DOMAIN = 'phone.broilerhq.app'

/** Firebase rejects passwords shorter than 6 characters. */
export const MIN_PASSWORD_LENGTH = 6

/** Bangladeshi mobile number in local form: 01 + operator digit (3-9) + 8 digits. */
export const BD_PHONE_PATTERN = /^01[3-9]\d{8}$/

export const MAX_NAME_LENGTH = 80

/** Loose shape check for the optional contact email; real validation isn't needed (unverified). */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const PASSWORD_RESET_STATUSES = ['pending', 'approved', 'rejected'] as const

/** Digits only, because the admin reads the temporary password to the user over the phone. */
export const TEMP_PASSWORD_LENGTH = 10
