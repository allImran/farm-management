import type { AppError } from './network'

/** Translated error per form field; a missing or `undefined` entry means the field is valid. */
export type FormErrors<K extends string = string> = Partial<Record<K, string>>

/** Props shared by the create/edit modals driven by `useEntityForm`. */
export interface EntityFormModalProps {
  isEditing: boolean
  errors: FormErrors
  error: AppError | null
  loading: boolean
}
