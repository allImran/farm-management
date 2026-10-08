import type { PAYMENT_REQUEST_STATUSES, SUBSCRIPTION_TYPES } from '~/constants/billing'
import type { BATCH_STATUSES, CONTACT_TYPES, EXPENSE_TYPES, MEDICINE_TYPES } from '~/constants/farm'

/** Calendar date stored as `YYYY-MM-DD` (no time zone, sorts lexically). */
export type IsoDate = string

interface Timestamps {
  /** `null` only for a just-written doc whose server timestamp hasn't resolved yet. */
  createdAt: Date | null
  updatedAt: Date | null
}

// ---- Accounts & billing ----

export interface UserProfile {
  id: string
  name: string
  phone: string
  email: string | null
  createdAt: Date | null
}

export type SubscriptionType = (typeof SUBSCRIPTION_TYPES)[number]

export interface Subscription {
  userId: string
  type: SubscriptionType
  /** Both `null` for lifetime access. `endsAt` is exclusive. */
  startsAt: Date | null
  endsAt: Date | null
  updatedAt: Date | null
}

export type SubscriptionState = 'lifetime' | 'active' | 'expired' | 'scheduled' | 'none'

export type PaymentRequestStatus = (typeof PAYMENT_REQUEST_STATUSES)[number]

export interface PaymentRequest {
  id: string
  userId: string
  userName: string
  userPhone: string
  bkashLast4: string
  status: PaymentRequestStatus
  createdAt: Date | null
  reviewedAt: Date | null
  reviewNote: string | null
}

export interface PlanConfig {
  /** Price of one month of write access, in BDT. */
  monthlyPrice: number
  /** Monthly price of each farm beyond `INCLUDED_FARMS`, in BDT. */
  extraFarmPrice: number
  /** bKash number users send the payment to. */
  bkashNumber: string
  instructions: string
}

/** What the admin chooses when granting access. */
export type SubscriptionGrant =
  | { mode: 'months'; months: number }
  | { mode: 'lifetime' }
  | { mode: 'range'; startDate: IsoDate; endDate: IsoDate }

// ---- Farm data ----

export type BatchStatus = (typeof BATCH_STATUSES)[number]
export type ContactType = (typeof CONTACT_TYPES)[number]
export type ExpenseType = (typeof EXPENSE_TYPES)[number]
export type MedicineType = (typeof MEDICINE_TYPES)[number]

export interface FarmInput {
  name: string
  address: string
}
export interface Farm extends FarmInput, Timestamps {
  id: string
}

export interface BatchInput {
  farmId: string
  name: string
  breed: string
  startDate: IsoDate
  initialQuantity: number
  status: BatchStatus
  note: string
}
export interface Batch extends BatchInput, Timestamps {
  id: string
}

export interface ContactInput {
  name: string
  phone: string
  address: string
  types: ContactType[]
  notes: string
}
export interface Contact extends ContactInput, Timestamps {
  id: string
}
