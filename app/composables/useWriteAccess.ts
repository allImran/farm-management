/**
 * Gate for write actions. Reading is free; adding or changing data needs an active
 * subscription, so blocked actions open the payment-request modal instead.
 *
 * @returns `canWrite`, the modal's `isPaymentModalOpen` state, `openPaymentModal()` and
 *          `guardWrite(action)`, which runs `action` only when writing is allowed.
 */
export const useWriteAccess = () => {
  const billingStore = useBillingStore()
  const { canWrite } = storeToRefs(billingStore)
  const isPaymentModalOpen = useState('payment-modal-open', () => false)

  const openPaymentModal = () => {
    isPaymentModalOpen.value = true
  }

  const guardWrite = (action: () => void) => {
    if (canWrite.value) action()
    else openPaymentModal()
  }

  return { canWrite, isPaymentModalOpen, openPaymentModal, guardWrite }
}
