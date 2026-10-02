import { isIsoDate } from '~/utils/date'

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

  return { text, number, date }
}
