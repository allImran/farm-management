import type { AppError, RequestStatus, Result } from '~/types/network'

export type FormErrors = Record<string, string | undefined>

interface EntityFormOptions<TValues extends object, TEntity extends { id: string }> {
  /** Values for a blank "create" form. */
  empty: () => TValues
  /** Values for editing an existing entity. */
  fromEntity: (entity: TEntity) => TValues
  /** @returns field errors (already translated); empty object when valid. */
  validate: (values: TValues) => FormErrors
  /** Creates (`editing === null`) or updates the entity. */
  save: (values: TValues, editing: TEntity | null) => Promise<Result<unknown>>
  onSaved?: () => void
}

/**
 * Create/edit modal form for one entity type (farm, batch, contact, record).
 * Write access is checked when the form opens; blocked users see the payment modal instead.
 *
 * @returns `isOpen`, `editing`, `values`, `errors`, `status`, `error`, `openCreate()`,
 *          `openEdit(entity)` and `handleSubmit()`. Input is kept when saving fails.
 */
export const useEntityForm = <TValues extends object, TEntity extends { id: string }>(
  options: EntityFormOptions<TValues, TEntity>,
) => {
  const { guardWrite } = useWriteAccess()

  const isOpen = ref(false)
  const editing = shallowRef<TEntity | null>(null)
  const values = ref(options.empty()) as Ref<TValues>
  const errors = ref<FormErrors>({})
  const status = ref<RequestStatus>('idle')
  const error = shallowRef<AppError | null>(null)

  const open = (entity: TEntity | null) =>
    guardWrite(() => {
      editing.value = entity
      values.value = entity ? options.fromEntity(entity) : options.empty()
      errors.value = {}
      error.value = null
      status.value = 'idle'
      isOpen.value = true
    })

  const handleSubmit = async () => {
    errors.value = options.validate(values.value)
    if (Object.values(errors.value).some(Boolean)) return

    status.value = 'loading'
    error.value = null
    const result = await options.save(values.value, editing.value)
    if (result.error) {
      error.value = result.error
      status.value = 'error'
      return
    }
    status.value = 'success'
    isOpen.value = false
    options.onSaved?.()
  }

  return {
    isOpen,
    editing,
    values,
    errors,
    status,
    error,
    isEditing: computed(() => editing.value !== null),
    openCreate: () => open(null),
    openEdit: (entity: TEntity) => open(entity),
    handleSubmit,
  }
}
