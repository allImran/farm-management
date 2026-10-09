import type { FormErrors } from '~/types/forms'
import type { Result } from '~/types/network'
import { hasErrors } from '~/utils/forms'

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
 * @returns `isOpen`, `editing`, `values`, `errors`, `status`, `error`, `isLoading`, `openCreate()`,
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
  const { status, error, isLoading, execute, reset } = useAsyncState(options.save)

  const open = (entity: TEntity | null) =>
    guardWrite(() => {
      editing.value = entity
      values.value = entity ? options.fromEntity(entity) : options.empty()
      errors.value = {}
      reset()
      isOpen.value = true
    })

  const handleSubmit = async () => {
    errors.value = options.validate(values.value)
    if (hasErrors(errors.value)) return
    const result = await execute(values.value, editing.value)
    if (result.error) return
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
    isLoading,
    isEditing: computed(() => editing.value !== null),
    openCreate: () => open(null),
    openEdit: (entity: TEntity) => open(entity),
    handleSubmit,
  }
}
