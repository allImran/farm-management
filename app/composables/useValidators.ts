import { EMAIL_PATTERN, MIN_PASSWORD_LENGTH } from '~/constants/auth'
import { isIsoDate } from '~/utils/date'
import { normalizeBdPhone } from '~/utils/phone'

interface TextRule {
  required?: boolean
  max: number
}

interface NumberRule {
  required?: boolean
  min?: number
  isInteger?: boolean
}

/**
 * Field validators returning a translated message, or `undefined` when valid.
 * Client checks are for UX only; `firestore.rules` enforces the same limits.
 */
export const useValidators = () => {
  const { t } = useI18n()

  const required = (value: string) => (value ? undefined : t('validation.required'))

  const text = (value: string | null | undefined, rule: TextRule) => {
    const trimmed = (value ?? '').trim()
    if (rule.required && !trimmed) return t('validation.required')
    if (trimmed.length > rule.max) return t('validation.tooLong', { max: rule.max })
    return undefined
  }

  const number = (value: string | number | null | undefined, rule: NumberRule = {}) => {
    if (value === '' || value === null || value === undefined) return rule.required ? t('validation.required') : undefined
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return t('validation.number')
    if (rule.isInteger && !Number.isInteger(parsed)) return t('validation.integer')
    if (rule.min !== undefined && parsed < rule.min) return t('validation.min', { min: rule.min })
    return undefined
  }

  const date = (value: string | null | undefined, rule: { required?: boolean } = { required: true }) => {
    if (!value) return rule.required ? t('validation.required') : undefined
    return isIsoDate(value) ? undefined : t('validation.date')
  }

  /** A Bangladeshi mobile number (see `normalizeBdPhone`); optional ones may be left blank. */
  const phone = (value: string, { required: isRequired = true } = {}) => {
    if (!isRequired && !value.trim()) return undefined
    return normalizeBdPhone(value) ? undefined : t('validation.phone')
  }

  /** An optional email: blank is fine, anything else must look like an address. */
  const email = (value: string) => {
    const trimmed = value.trim()
    return trimmed && !EMAIL_PATTERN.test(trimmed) ? t('validation.email') : undefined
  }

  /** A password the user is choosing (Firebase rejects short ones). */
  const newPassword = (value: string) =>
    value.length < MIN_PASSWORD_LENGTH ? t('validation.passwordLength', { min: MIN_PASSWORD_LENGTH }) : undefined

  /** The "repeat password" field. */
  const confirmation = (value: string, password: string) => (value === password ? undefined : t('validation.passwordMatch'))

  return { required, text, number, date, phone, email, newPassword, confirmation }
}
