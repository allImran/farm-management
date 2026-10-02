import { EMAIL_PATTERN, MAX_NAME_LENGTH } from '~/constants/auth'
import type { AppError } from '~/types/network'

/**
 * Edit name and optional email on the account page. The phone number is the login id and
 * cannot be changed.
 */
export const useProfileForm = () => {
  const { t } = useI18n()
  const authStore = useAuthStore()
  const { profile } = storeToRefs(authStore)

  const values = reactive({ name: profile.value?.name ?? '', email: profile.value?.email ?? '' })
  const errors = ref<{ name?: string; email?: string }>({})
  const error = shallowRef<AppError | null>(null)
  const isSubmitting = ref(false)
  const isSaved = ref(false)
  const phone = computed(() => profile.value?.phone ?? '')

  const handleSubmit = async () => {
    const name = values.name.trim()
    const email = values.email.trim()
    errors.value = {
      name: !name ? t('validation.required') : name.length > MAX_NAME_LENGTH ? t('validation.tooLong', { max: MAX_NAME_LENGTH }) : undefined,
      email: email && !EMAIL_PATTERN.test(email) ? t('validation.email') : undefined,
    }
    if (errors.value.name || errors.value.email) return

    isSubmitting.value = true
    isSaved.value = false
    error.value = null
    const result = await authStore.saveProfile({ name, email: email || null })
    isSubmitting.value = false
    if (result.error) error.value = result.error
    else isSaved.value = true
  }

  return { values, errors, error, isSubmitting, isSaved, phone, handleSubmit }
}
