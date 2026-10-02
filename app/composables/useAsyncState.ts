import type { AppError, RequestStatus, Result } from '~/types/network'

/**
 * Tracks one component-local async call made through `request()`.
 *
 * @param operation a service call returning a `Result`.
 * @returns `data`, `status`, `error` refs and `execute(...args)`, which runs the call and
 *          resolves with its `Result` (so callers can branch on success).
 */
export const useAsyncState = <T, Args extends unknown[]>(operation: (...args: Args) => Promise<Result<T>>) => {
  const data = shallowRef<T | null>(null)
  const status = ref<RequestStatus>('idle')
  const error = shallowRef<AppError | null>(null)
  let latestCall = 0

  const execute = async (...args: Args): Promise<Result<T>> => {
    const call = ++latestCall
    status.value = 'loading'
    error.value = null
    const result = await operation(...args)
    // Ignore responses that a newer call has superseded.
    if (call !== latestCall) return result
    if (result.error) {
      error.value = result.error
      status.value = 'error'
    } else {
      data.value = result.data
      status.value = 'success'
    }
    return result
  }

  const isLoading = computed(() => status.value === 'loading')

  return { data, status, error, isLoading, execute }
}
