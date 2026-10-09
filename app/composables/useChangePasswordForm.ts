import { MIN_PASSWORD_LENGTH } from '~/constants/auth'
import type { AppError } from '~/types/network'

type PasswordField = 'currentPassword' | 'newPassword' | 'confirmPassword'

// Firebase reports a wrong current password with these codes; shown on the field instead.
const WRONG_PASSWORD_CODES = new Set(['auth/invalid-credential', 'auth/wrong-password'])

/**
 * Change-password form on the account page. Firebase needs the current password; after an
 * admin reset that is the temporary password the admin gave the user, and saving also clears the "must change" flag.
 */
export const useChangePasswordForm = () => {
  const { t } = useI18n()
  const authStore = useAuthStore()

  const values = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const errors = ref<Partial<Record<PasswordField, string>>>({})
  const error = shallowRef<AppError | null>(null)
  const isSubmitting = ref(false)
  const isSaved = ref(false)

  const validate = () => {
    const next: Partial<Record<PasswordField, string>> = {}
    if (!values.currentPassword) next.currentPassword = t('validation.required')
    if (values.newPassword.length < MIN_PASSWORD_LENGTH) next.newPassword = t('validation.passwordLength', { min: MIN_PASSWORD_LENGTH })
    else if (values.newPassword === values.currentPassword) next.newPassword = t('account.password.sameAsCurrent')
    if (values.confirmPassword !== values.newPassword) next.confirmPassword = t('validation.passwordMatch')
    errors.value = next
    return Object.keys(next).length === 0
  }

  const handleSubmit = async () => {
    isSaved.value = false
    error.value = null
    if (!validate()) return

    isSubmitting.value = true
    const result = await authStore.changePassword(values.currentPassword, values.newPassword)
    isSubmitting.value = false
    if (!result.error) {
      Object.assign(values, { currentPassword: '', newPassword: '', confirmPassword: '' })
      isSaved.value = true
    } else if (WRONG_PASSWORD_CODES.has(result.error.code)) {
      errors.value = { currentPassword: t('account.password.wrongCurrent') }
    } else {
      error.value = result.error
    }
  }

  return { values, errors, error, isSubmitting, isSaved, handleSubmit }
}
