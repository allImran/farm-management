import type { FormErrors } from '~/types/forms'

/** Whether any field of a validated form has an error. */
export const hasErrors = (errors: FormErrors) => Object.values(errors).some(Boolean)
