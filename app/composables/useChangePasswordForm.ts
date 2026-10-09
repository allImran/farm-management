import type { FormErrors } from '~/types/forms'
import { hasErrors } from '~/utils/forms'

// Firebase reports a wrong current password with these codes; shown on the field instead.
const WRONG_PASSWORD_CODES = new Set(['auth/invalid-credential', 'auth/wrong-password'])

/**
 * Change-password form on the account page. Firebase needs the current password; after an
 * admin reset that is the temporary password the admin gave the user, and saving also clears
 * the "must change" flag.
 *
 * @returns form `values`, field `errors`, request `error`, `isLoading`, `isSaved` and `handleSubmit`.
 */
export const useChangePasswordForm = () => {
  const { t } = useI18n()
  const authStore = useAuthStore()
  const validators = useValidators()

  const values = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const errors = ref<FormErrors<keyof typeof values>>({})
  const state = useAsyncState(authStore.changePassword)
  const isSaved = computed(() => state.status.value === 'success')
  const error = computed(() => (state.error.value && !WRONG_PASSWORD_CODES.has(state.error.value.code) ? state.error.value : null))

  const handleSubmit = async () => {
    state.reset()
    const { currentPassword, newPassword, confirmPassword } = values
    errors.value = {
      currentPassword: validators.required(currentPassword),
      newPassword:
        validators.newPassword(newPassword) ??
        (newPassword === currentPassword ? t('account.password.sameAsCurrent') : undefined),
      confirmPassword: validators.confirmation(confirmPassword, newPassword),
    }
    if (hasErrors(errors.value)) return

    const result = await state.execute(currentPassword, newPassword)
    if (!result.error) Object.assign(values, { currentPassword: '', newPassword: '', confirmPassword: '' })
    else if (WRONG_PASSWORD_CODES.has(result.error.code)) errors.value = { currentPassword: t('account.password.wrongCurrent') }
  }

  return { values, errors, error, isLoading: state.isLoading, isSaved, handleSubmit }
}
