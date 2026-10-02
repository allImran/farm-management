import { MAX_PAGE_SIZE } from '~/constants/pagination'
import { fetchContactsPage } from '~/services/contacts.service'
import type { Contact } from '~/types/models'
import type { AppError, RequestStatus } from '~/types/network'

/**
 * Contacts for pickers and for showing names in record lists. Loads the first
 * `MAX_PAGE_SIZE` contacts alphabetically, once per session; the contacts page manages the
 * full, paginated list and calls `invalidate()` after edits.
 */
export const useContactsStore = defineStore('contacts', () => {
  const { uid } = storeToRefs(useAuthStore())
  const options = ref<Contact[]>([])
  const status = ref<RequestStatus>('idle')
  const error = ref<AppError | null>(null)

  const byId = computed(() => new Map(options.value.map((contact) => [contact.id, contact])))

  const ensureLoaded = async () => {
    if (!uid.value || status.value === 'loading' || status.value === 'success') return
    status.value = 'loading'
    const result = await fetchContactsPage(uid.value, { pageSize: MAX_PAGE_SIZE, cursor: null })
    if (result.error) {
      error.value = result.error
      status.value = 'error'
      return
    }
    options.value = result.data.items
    status.value = 'success'
  }

  const invalidate = () => {
    status.value = 'idle'
  }

  watch(uid, () => {
    options.value = []
    invalidate()
  })

  return { options, status, error, byId, ensureLoaded, invalidate }
})
