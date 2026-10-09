import { EMAIL_PATTERN, MAX_NAME_LENGTH, MIN_PASSWORD_LENGTH } from '~/constants/auth'
import { ROUTES } from '~/constants/routes'
import { createPasswordResetRequest } from '~/services/passwordResets.service'
import type { AppError } from '~/types/network'
import { authEmailToPhone, normalizeBdPhone } from '~/utils/phone'

type FieldErrors<K extends string> = Partial<Record<K, string>>

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
 * @returns form `values`, field `errors`, the request `error`, `isSubmitting` and `handleSubmit`.
 */
export const useLoginForm = () => {
  const { t } = useI18n()
  const authStore = useAuthStore()
  const redirectTarget = useRedirectTarget()

  const values = reactive({ phone: '', password: '' })
  const errors = ref<FieldErrors<'phone' | 'password'>>({})
  const error = shallowRef<AppError | null>(null)
  const isSubmitting = ref(false)

  const handleSubmit = async () => {
    const phone = normalizeBdPhone(values.phone)
    errors.value = {
      phone: phone ? undefined : t('validation.phone'),
      password: values.password ? undefined : t('validation.required'),
    }
    if (!phone || !values.password) return

    isSubmitting.value = true
    error.value = null
    const result = await authStore.signIn(phone, values.password)
    isSubmitting.value = false
    if (result.error) {
      error.value = result.error
      return
    }
    await navigateTo(redirectTarget())
  }

  return { values, errors, error, isSubmitting, handleSubmit }
}

/**
 * Sign-up form (name, phone, optional email, password). If the account exists but its profile
 * doc is missing (an interrupted sign-up), only the profile part is shown and submitted.
 *
 * @returns form `values`, `errors`, request `error`, `isSubmitting`, `isCompletingProfile` and `handleSubmit`.
 */
export const useSignupForm = () => {
  const { t } = useI18n()
  const authStore = useAuthStore()
  const { needsProfile, user } = storeToRefs(authStore)
  const redirectTarget = useRedirectTarget()

  const values = reactive({ name: '', phone: '', email: '', password: '', confirmPassword: '' })
  const errors = ref<FieldErrors<keyof typeof values>>({})
  const error = shallowRef<AppError | null>(null)
  const isSubmitting = ref(false)

  const isCompletingProfile = computed(() => needsProfile.value)
  watchEffect(() => {
    const phone = authEmailToPhone(user.value?.email ?? null)
    if (isCompletingProfile.value && phone) values.phone = phone
  })

  const validate = () => {
    const name = values.name.trim()
    const email = values.email.trim()
    const next: FieldErrors<keyof typeof values> = {}
    if (!name) next.name = t('validation.required')
    else if (name.length > MAX_NAME_LENGTH) next.name = t('validation.tooLong', { max: MAX_NAME_LENGTH })
    if (!normalizeBdPhone(values.phone)) next.phone = t('validation.phone')
    if (email && !EMAIL_PATTERN.test(email)) next.email = t('validation.email')
    if (!isCompletingProfile.value) {
      if (values.password.length < MIN_PASSWORD_LENGTH) next.password = t('validation.passwordLength', { min: MIN_PASSWORD_LENGTH })
      if (values.confirmPassword !== values.password) next.confirmPassword = t('validation.passwordMatch')
    }
    errors.value = next
    return Object.keys(next).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    const profile = {
      name: values.name.trim(),
      phone: normalizeBdPhone(values.phone) ?? '',
      email: values.email.trim() || null,
    }

    isSubmitting.value = true
    error.value = null
    const result =
      isCompletingProfile.value && user.value
        ? await authStore.completeProfile(user.value.uid, profile)
        : await authStore.signUp({ ...profile, password: values.password })
    isSubmitting.value = false
    if (result.error) {
      error.value = result.error
      return
    }
    await navigateTo(redirectTarget())
  }

  return { values, errors, error, isSubmitting, isCompletingProfile, handleSubmit }
}

/**
 * Forgot-password form: sends a reset request for a phone number to the admin. The answer is
 * the same whether or not an account uses the number, so the form can't be used to find out.
 *
 * @returns form `values`, the field `error` for the phone, `status`, request `error` and `handleSubmit`.
 */
export const useForgotPasswordForm = () => {
  const { t } = useI18n()
  const values = reactive({ phone: '' })
  const phoneError = ref<string | undefined>()
  const { status, error, execute } = useAsyncState(createPasswordResetRequest)

  const handleSubmit = async () => {
    const phone = normalizeBdPhone(values.phone)
    phoneError.value = phone ? undefined : t('validation.phone')
    if (!phone) return
    await execute(phone)
  }

  return { values, phoneError, status, error, handleSubmit }
}
