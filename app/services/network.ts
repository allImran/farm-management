import type { AppError, Result } from '~/types/network'

/**
 * The central request wrapper. Every Firebase or HTTP call in the app goes through `request()`,
 * which turns any thrown error into one `AppError` shape with a translated, user-safe message.
 */

type Translate = (key: string) => string

interface NetworkConfig {
  translate: Translate
  /** Called once when Firebase reports that the session is no longer valid. */
  onAuthExpired: () => void
}

let config: NetworkConfig = {
  translate: (key) => key,
  onAuthExpired: () => {},
}

/** Wires translations and the auth-expiry handler; called once from the Firebase plugin. */
export const configureNetwork = (next: NetworkConfig) => {
  config = next
}

// Firebase error code → i18n key under `errors.`. Unknown codes fall back to `errors.unknown`.
const MESSAGE_KEYS: Record<string, string> = {
  'permission-denied': 'permissionDenied',
  'not-found': 'notFound',
  unauthenticated: 'unauthenticated',
  unavailable: 'unavailable',
  'deadline-exceeded': 'unavailable',
  'resource-exhausted': 'tooManyRequests',
  'failed-precondition': 'failedPrecondition',
  'already-exists': 'alreadyExists',
  'invalid-argument': 'invalidArgument',
  'auth/invalid-credential': 'invalidCredential',
  'auth/wrong-password': 'invalidCredential',
  'auth/user-not-found': 'invalidCredential',
  'auth/invalid-email': 'invalidCredential',
  'auth/email-already-in-use': 'phoneInUse',
  'auth/weak-password': 'weakPassword',
  'auth/too-many-requests': 'tooManyRequests',
  'auth/network-request-failed': 'offline',
  'auth/user-disabled': 'userDisabled',
  'auth/user-token-expired': 'sessionExpired',
  'auth/invalid-user-token': 'sessionExpired',
  offline: 'offline',
  timeout: 'unavailable',
}

const AUTH_EXPIRED_CODES = new Set(['auth/user-token-expired', 'auth/invalid-user-token', 'auth/user-disabled'])

/** HTTP status → stable code, for `$fetch` errors. */
const HTTP_CODES: Record<number, string> = {
  400: 'invalid-argument',
  401: 'unauthenticated',
  403: 'permission-denied',
  404: 'not-found',
  429: 'resource-exhausted',
  503: 'unavailable',
}

const readCode = (error: unknown): string => {
  if (import.meta.client && !navigator.onLine) return 'offline'
  if (typeof error !== 'object' || error === null) return 'unknown'
  if ('code' in error && typeof error.code === 'string') {
    // Firestore codes may arrive prefixed, e.g. 'firestore/permission-denied'.
    return error.code.replace(/^firestore\//, '')
  }
  if ('statusCode' in error && typeof error.statusCode === 'number') {
    return HTTP_CODES[error.statusCode] ?? 'unknown'
  }
  return 'unknown'
}

/** Builds an `AppError` with a translated message; also used for client-side failures. */
export const createAppError = (code: string, cause?: unknown): AppError => ({
  code,
  message: config.translate(`errors.${MESSAGE_KEYS[code] ?? 'unknown'}`),
  cause,
})

/**
 * Runs an async operation and returns its value or a normalized error. Never throws.
 *
 * @param operation the Firebase/HTTP call to run.
 * @returns `{ data, error: null }` on success, `{ data: null, error }` on failure.
 */
export const request = async <T>(operation: () => Promise<T>): Promise<Result<T>> => {
  try {
    return { data: await operation(), error: null }
  } catch (cause) {
    const code = readCode(cause)
    if (import.meta.dev) console.warn(`[network] ${code}`, cause)
    if (AUTH_EXPIRED_CODES.has(code)) config.onAuthExpired()
    return { data: null, error: createAppError(code, cause) }
  }
}
