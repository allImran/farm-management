import type { AppError, Result } from '~/types/network'

/** The success value of each `Result` in a tuple. */
type Values<T extends readonly Result<unknown>[]> = { -readonly [K in keyof T]: Extract<T[K], { error: null }>['data'] }

/**
 * Combines the results of requests made in parallel (`Promise.all`).
 *
 * @returns every value, in order, or the first error.
 */
export const combineResults = <const T extends readonly Result<unknown>[]>(results: T): Result<Values<T>> => {
  const failed = results.find((result): result is { data: null; error: AppError } => result.error !== null)
  if (failed) return failed
  return { data: results.map((result) => result.data) as Values<T>, error: null }
}

/** Transforms a successful result's value; errors pass through unchanged. */
export const mapResult = <T, U>(result: Result<T>, map: (data: T) => U): Result<U> =>
  result.error ? result : { data: map(result.data), error: null }
