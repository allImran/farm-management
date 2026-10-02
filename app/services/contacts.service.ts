import {
  addDoc,
  deleteDoc,
  doc,
  documentId,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
} from 'firebase/firestore'
import { USER_COLLECTIONS } from '~/constants/collections'
import type { Contact, ContactInput, ContactType } from '~/types/models'
import type { PageRequest } from '~/types/pagination'
import { creationTimestamps, fetchPage, toDate, userCollection } from './firestore'
import { request } from './network'

/** CRUD for `users/{uid}/contacts` (suppliers, customers, vets, ...). */

const contacts = (uid: string) => userCollection(uid, USER_COLLECTIONS.contacts)

const toContact = (snapshot: DocumentSnapshot<DocumentData>): Contact => {
  const data = snapshot.data() ?? {}
  return {
    id: snapshot.id,
    name: data.name ?? '',
    phone: data.phone ?? '',
    address: data.address ?? '',
    types: data.types ?? [],
    notes: data.notes ?? '',
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  }
}

/** Alphabetical, optionally only contacts of one type. */
export const fetchContactsPage = (uid: string, page: PageRequest, filters: { type?: ContactType | null } = {}) =>
  request(() => {
    const typeFilter = filters.type ? [where('types', 'array-contains', filters.type)] : []
    return fetchPage(query(contacts(uid), ...typeFilter, orderBy('name'), orderBy(documentId())), page, toContact)
  })

/** @returns the new contact's id. */
export const createContact = (uid: string, input: ContactInput) =>
  request(async () => (await addDoc(contacts(uid), { ...input, ...creationTimestamps() })).id)

export const updateContact = (uid: string, contactId: string, input: ContactInput) =>
  request(() => updateDoc(doc(contacts(uid), contactId), { ...input, updatedAt: serverTimestamp() }))

/** Records keep the deleted contact's id; the UI simply shows it as unknown. */
export const deleteContact = (uid: string, contactId: string) => request(() => deleteDoc(doc(contacts(uid), contactId)))
