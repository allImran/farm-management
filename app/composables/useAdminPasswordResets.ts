import { prepareGoogleSignIn } from '~/services/googleAuth.service'
import { request } from '~/services/network'
import { approvePasswordResetRequest, fetchPasswordResetRequestsPage, rejectPasswordResetRequest } from '~/services/passwordResets.service'
import { fetchUsersByPhones } from '~/services/users.service'
import type { PasswordResetRequest, PasswordResetStatus, UserProfile } from '~/types/models'
import type { RequestStatus, Result } from '~/types/network'
import { mapResult } from '~/utils/result'

/**
 * Admin: password-reset requests with one status, as numbered pages, plus the account behind
 * each number so the admin can see whose password they are resetting (the request itself only
 * holds the phone number a signed-out visitor typed).
 */
export const useAdminPasswordResets = (status: () => PasswordResetStatus) => {
  const list = usePagination((page) => fetchPasswordResetRequestsPage(page, status()), { mode: 'pages', filters: status })

  const accounts = shallowRef<Record<string, UserProfile>>({})
  const accountsStatus = ref<RequestStatus>('idle')
  watch(list.items, async (requests) => {
    accounts.value = {}
    if (!requests.length) return
    accountsStatus.value = 'loading'
    const result = await fetchUsersByPhones(requests.map((request) => request.phone))
    if (result.data) accounts.value = result.data
    accountsStatus.value = result.error ? 'error' : 'success'
  })

  return { ...list, accounts, accountsStatus }
}

// Codes approving throws for expected cases; shown with an admin-specific message.
const APPROVE_ERROR_KEYS: Record<string, string> = {
  'not-found': 'admin.resets.noAccount',
  'failed-precondition': 'admin.resets.notPending',
  'reset-admin-account': 'admin.resets.adminAccount',
  'google-sign-in-failed': 'admin.resets.googleSignIn',
  'google-permission-denied': 'admin.resets.googleNoAccess',
}

/**
 * Admin: approve / reject confirmations for a password-reset request. Approving sets a random
 * one-time password, so the dialog asks the admin to confirm with the user first; afterwards
 * `issued` holds that password for the admin to read to the user. It is kept only in memory.
 * Approving needs the admin's Google account (it may show Google's sign-in popup).
 */
export const usePasswordResetReview = (onReviewed: () => void) => {
  const { t } = useI18n()
  const { uid } = storeToRefs(useAuthStore())
  const config = useRuntimeConfig().public
  const authAdminConfig = { projectId: config.firebaseProjectId, useEmulator: String(config.firebaseUseEmulators) === 'true' }
  const target = shallowRef<PasswordResetRequest | null>(null)
  const action = ref<'approve' | 'reject'>('approve')
  const isOpen = ref(false)
  const issued = shallowRef<{ phone: string; password: string } | null>(null)
  // Approving resolves with the issued password; rejecting resolves with nothing (null).
  const state = useAsyncState(
    async (request: PasswordResetRequest, adminId: string): Promise<Result<string | null>> =>
      action.value === 'approve'
        ? approvePasswordResetRequest(authAdminConfig, request.phone, adminId)
        : mapResult(await rejectPasswordResetRequest(request.phone, adminId), () => null),
  )

  const error = computed(() => {
    const value = state.error.value
    const key = value && action.value === 'approve' ? APPROVE_ERROR_KEYS[value.code] : undefined
    return value && key ? { ...value, message: t(key) } : value
  })

  const open = (resetRequest: PasswordResetRequest, nextAction: 'approve' | 'reject') => {
    target.value = resetRequest
    action.value = nextAction
    state.reset()
    isOpen.value = true
    // Load Google sign-in now: its popup is only allowed straight from the confirm click.
    if (nextAction === 'approve' && !authAdminConfig.useEmulator) request(() => prepareGoogleSignIn(config.googleOauthClientId))
  }

  const confirm = async () => {
    const request = target.value
    if (!request || !uid.value) return
    const result = await state.execute(request, uid.value)
    if (result.error) return
    isOpen.value = false
    if (result.data) issued.value = { phone: request.phone, password: result.data }
    onReviewed()
  }

  const dismissIssued = () => {
    issued.value = null
  }

  return { isOpen, target, action, status: state.status, isLoading: state.isLoading, error, issued, open, confirm, dismissIssued }
}
