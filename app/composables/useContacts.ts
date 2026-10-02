import { TEXT_LIMITS } from '~/constants/farm'
import { createContact, deleteContact, fetchContactsPage, updateContact } from '~/services/contacts.service'
import type { Contact, ContactInput, ContactType } from '~/types/models'
import { normalizeBdPhone } from '~/utils/phone'

/**
 * Paginated contacts ("Load more"), alphabetical; reloads when the type filter changes.
 *
 * @param type getter for the contact-type filter (`null` = all).
 */
export const useContactList = (type: () => ContactType | null) => {
  const uid = useSessionUid()
  const list = usePagination((page) => fetchContactsPage(uid(), page, { type: type() }))
  watch(type, () => list.reset(), { immediate: true })
  return list
}

/** Create/edit form for contacts. Saving also refreshes the cached picker options. */
export const useContactForm = (onSaved?: () => void) => {
  const uid = useSessionUid()
  const { t } = useI18n()
  const validators = useValidators()
  const contactsStore = useContactsStore()

  return useEntityForm<ContactInput, Contact>({
    empty: () => ({ name: '', phone: '', address: '', types: [], notes: '' }),
    fromEntity: ({ name, phone, address, types, notes }) => ({ name, phone, address, types: [...types], notes }),
    validate: (values) => ({
      name: validators.text(values.name, { required: true, max: TEXT_LIMITS.short }),
      // Phone is optional for contacts, but must be a valid BD number when given.
      phone: values.phone.trim() && !normalizeBdPhone(values.phone) ? t('validation.phone') : undefined,
      address: validators.text(values.address, { max: TEXT_LIMITS.medium }),
      notes: validators.text(values.notes, { max: TEXT_LIMITS.note }),
    }),
    save: (values, editing) => {
      const input: ContactInput = {
        name: values.name.trim(),
        phone: values.phone.trim() ? normalizeBdPhone(values.phone) ?? '' : '',
        address: values.address.trim(),
        types: values.types,
        notes: values.notes.trim(),
      }
      return editing ? updateContact(uid(), editing.id, input) : createContact(uid(), input)
    },
    onSaved: () => {
      contactsStore.invalidate()
      onSaved?.()
    },
  })
}

export const useContactDelete = (onDeleted?: () => void) => {
  const uid = useSessionUid()
  const contactsStore = useContactsStore()
  return useDeleteAction<Contact>({
    remove: (contact) => deleteContact(uid(), contact.id),
    onDeleted: () => {
      contactsStore.invalidate()
      onDeleted?.()
    },
  })
}
