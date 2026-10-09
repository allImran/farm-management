import { MAX_NAME_LENGTH } from '~/constants/auth'
import type { FormErrors } from '~/types/forms'
import { hasErrors } from '~/utils/forms'

/**
 * Edit name and optional email on the account page. The phone number is the login id and
 * cannot be changed.
 *
 * @returns form `values`, field `errors`, request `error`, `isLoading`, `isSaved`, the read-only
 *          `phone` and `handleSubmit`.
 */
export const useProfileForm = () => {
  const authStore = useAuthStore()
  const { profile } = storeToRefs(authStore)
  const validators = useValidators()

  const values = reactive({ name: profile.value?.name ?? '', email: profile.value?.email ?? '' })
  const errors = ref<FormErrors<keyof typeof values>>({})
  const { status, error, isLoading, execute, reset } = useAsyncState(authStore.saveProfile)
  const isSaved = computed(() => status.value === 'success')
  const phone = computed(() => profile.value?.phone ?? '')

  const handleSubmit = async () => {
    reset()
    errors.value = {
      name: validators.text(values.name, { required: true, max: MAX_NAME_LENGTH }),
      email: validators.email(values.email),
    }
    if (hasErrors(errors.value)) return
    await execute({ name: values.name.trim(), email: values.email.trim() || null })
  }

  return { values, errors, error, isLoading, isSaved, phone, handleSubmit }
}
