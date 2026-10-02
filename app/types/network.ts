export type RequestStatus = 'idle' | 'loading' | 'success' | 'error'

export interface AppError {
  /** Stable machine code, e.g. 'permission-denied'. */
  code: string
  /** Safe, user-facing message in the active language. */
  message: string
  /** Original error, for dev logging only. */
  cause?: unknown
}

export type Result<T> = { data: T; error: null } | { data: null; error: AppError }
