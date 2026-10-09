import { MAX_NAME_LENGTH } from '~/constants/auth'
import { ROUTES } from '~/constants/routes'
import { createPasswordResetRequest } from '~/services/passwordResets.service'
import type { FormErrors } from '~/types/forms'
import type { NewProfile } from '~/types/models'
import { hasErrors } from '~/utils/forms'
import { authEmailToPhone, normalizeBdPhone } from '~/utils/phone'

/** Where to go after signing in: the guarded page the user came from, else the dashboard. */
const useRedirectTarget = () => {
  const route = useRoute()
  return () => {
    const target = route.query.redirect
    // Only same-site paths, never `//evil.com`.
    return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') ? target : ROUTES.dashboard
  }
}

/**
 * Phone + password sign-in form.
 *
 * @returns form `values`, field `errors`, the request `error`, `isLoading` and `handleSubmit`.
 */
export const useLoginForm = () => {
  const authStore = useAuthStore()
  const validators = useValidators()
  const redirectTarget = useRedirectTarget()

  const values = reactive({ phone: '', password: '' })
  const errors = ref<FormErrors<keyof typeof values>>({})
  const { error, isLoading, execute } = useAsyncState(authStore.signIn)

  const handleSubmit = async () => {
    const phone = normalizeBdPhone(values.phone)
    errors.value = { phone: validators.phone(values.phone), password: validators.required(values.password) }
    if (!phone || hasErrors(errors.value)) return
    const result = await execute(phone, values.password)
    if (!result.error) await navigateTo(redirectTarget())
  }

  return { values, errors, error, isLoading, handleSubmit }
}

/**
 * Sign-up form (name, phone, optional email, password). If the account exists but its profile
 * doc is missing (an interrupted sign-up), only the profile part is shown and submitted.
 *
 * @returns form `values`, `errors`, request `error`, `isLoading`, `isCompletingProfile` and `handleSubmit`.
 */
export const useSignupForm = () => {
  const authStore = useAuthStore()
  const { needsProfile: isCompletingProfile, user } = storeToRefs(authStore)
  const validators = useValidators()
  const redirectTarget = useRedirectTarget()

  const values = reactive({ name: '', phone: '', email: '', password: '', confirmPassword: '' })
  const errors = ref<FormErrors<keyof typeof values>>({})
  const { error, isLoading, execute } = useAsyncState((profile: NewProfile) =>
    isCompletingProfile.value && user.value
      ? authStore.completeProfile(user.value.uid, profile)
      : authStore.signUp({ ...profile, password: values.password }),
  )

  // The account already exists, so its phone number is fixed.
  watchEffect(() => {
    const phone = authEmailToPhone(user.value?.email ?? null)
    if (isCompletingProfile.value && phone) values.phone = phone
  })

  const handleSubmit = async () => {
    const phone = normalizeBdPhone(values.phone)
    errors.value = {
      name: validators.text(values.name, { required: true, max: MAX_NAME_LENGTH }),
      phone: validators.phone(values.phone),
      email: validators.email(values.email),
      ...(isCompletingProfile.value
        ? {}
        : {
            password: validators.newPassword(values.password),
            confirmPassword: validators.confirmation(values.confirmPassword, values.password),
          }),
    }
    if (!phone || hasErrors(errors.value)) return
    const result = await execute({ name: values.name.trim(), phone, email: values.email.trim() || null })
    if (!result.error) await navigateTo(redirectTarget())
  }

  return { values, errors, error, isLoading, isCompletingProfile, handleSubmit }
}

/**
 * Forgot-password form: sends a reset request for a phone number to the admin. The answer is
 * the same whether or not an account uses the number, so the form can't be used to find out.
 *
 * @returns form `values`, the field `error` for the phone, `status`, request `error` and `handleSubmit`.
 */
export const useForgotPasswordForm = () => {
  const validators = useValidators()
  const values = reactive({ phone: '' })
  const phoneError = ref<string | undefined>()
  const { status, error, execute } = useAsyncState(createPasswordResetRequest)

  const handleSubmit = async () => {
    const phone = normalizeBdPhone(values.phone)
    phoneError.value = validators.phone(values.phone)
    if (phone) await execute(phone)
  }

  return { values, phoneError, status, error, handleSubmit }
}
