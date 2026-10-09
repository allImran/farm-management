import { fetchPaymentRequestsPage, rejectPaymentRequest } from '~/services/billing.service'
import { countFarmsByUser } from '~/services/farms.service'
import type { PaymentRequest, PaymentRequestStatus } from '~/types/models'

/**
 * Admin: bKash payment requests with one status, as numbered pages, plus each requester's
 * current farm count so the admin can check the amount paid covers their extra farms.
 * The `admin` middleware hides the page; `firestore.rules` is what actually blocks others.
 */
export const useAdminPaymentRequests = (status: () => PaymentRequestStatus) => {
  const list = usePagination((page) => fetchPaymentRequestsPage(page, status()), { mode: 'pages', filters: status })

  const farmCounts = shallowRef<Record<string, number>>({})
  watch(list.items, async (requests) => {
    farmCounts.value = {}
    if (!requests.length) return
    const result = await countFarmsByUser(requests.map((request) => request.userId))
    if (!result.error) farmCounts.value = result.data
  })

  return { ...list, farmCounts }
}

/** Admin: reject-a-request dialog with an optional note shown to the user. */
export const useRejectRequest = (onRejected: () => void) => {
  const { uid } = storeToRefs(useAuthStore())
  const isOpen = ref(false)
  const target = shallowRef<PaymentRequest | null>(null)
  const note = ref('')
  const { status, error, isLoading, execute, reset } = useAsyncState(rejectPaymentRequest)

  const open = (request: PaymentRequest) => {
    target.value = request
    note.value = ''
    reset()
    isOpen.value = true
  }

  const confirm = async () => {
    if (!target.value || !uid.value) return
    const result = await execute(target.value.id, uid.value, note.value.trim() || null)
    if (result.error) return
    isOpen.value = false
    onRejected()
  }

  return { isOpen, target, note, status, error, isLoading, open, confirm }
}
