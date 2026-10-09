import type { PASSWORD_RESET_STATUSES } from '~/constants/auth'
import type { PAYMENT_REQUEST_STATUSES, SUBSCRIPTION_TYPES } from '~/constants/billing'
import type { ALL_EXPENSE_TYPES, BATCH_STATUSES, CONTACT_TYPES } from '~/constants/farm'

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
  /** Set when the admin reset the password to the temporary one; cleared once the user changes it. */
  mustChangePassword: boolean
}

/** What a user enters about themselves when signing up. */
export interface NewProfile {
  name: string
  phone: string
  email: string | null
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

export type PasswordResetStatus = (typeof PASSWORD_RESET_STATUSES)[number]

/** A signed-out user's request to have their password reset; the id is the phone number. */
export interface PasswordResetRequest {
  phone: string
  status: PasswordResetStatus
  createdAt: Date | null
  reviewedAt: Date | null
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
export type ExpenseType = (typeof ALL_EXPENSE_TYPES)[number]

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
