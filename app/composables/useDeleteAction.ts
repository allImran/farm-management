import type { AppError, RequestStatus, Result } from '~/types/network'

interface DeleteOptions<T> {
  remove: (target: T) => Promise<Result<unknown>>
  /** Optional pre-check; resolving `true` blocks deletion with `blockedErrorKey`. */
  isBlocked?: (target: T) => Promise<Result<boolean>>
  blockedErrorKey?: string
  onDeleted?: (target: T) => void
}

/**
 * Confirm-then-delete flow for `BaseConfirmDialog`.
 *
 * @returns `isOpen`, `target`, `status`, `error`, `open(target)` and `confirm()`.
 */
export const useDeleteAction = <T>(options: DeleteOptions<T>) => {
  const { t } = useI18n()
  const { guardWrite } = useWriteAccess()

  const isOpen = ref(false)
  const target = shallowRef<T | null>(null)
  const status = ref<RequestStatus>('idle')
  const error = shallowRef<AppError | null>(null)

  const open = (next: T) =>
    guardWrite(() => {
      target.value = next
      status.value = 'idle'
      error.value = null
      isOpen.value = true
    })

  const fail = (appError: AppError) => {
    error.value = appError
    status.value = 'error'
  }

  const confirm = async () => {
    const current = target.value
    if (!current) return
    status.value = 'loading'
    error.value = null

    if (options.isBlocked) {
      const check = await options.isBlocked(current)
      if (check.error) return fail(check.error)
      if (check.data) {
        return fail({ code: 'failed-precondition', message: t(options.blockedErrorKey ?? 'errors.failedPrecondition') })
      }
    }

    const result = await options.remove(current)
    if (result.error) return fail(result.error)
    status.value = 'success'
    isOpen.value = false
    options.onDeleted?.(current)
  }

  return { isOpen, target, status, error, isLoading: computed(() => status.value === 'loading'), open, confirm }
}
