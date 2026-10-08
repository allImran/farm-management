/**
 * Security-rules tests. Run with the emulator (needs Java 11+):
 *   npx firebase-tools emulators:exec --only firestore "npm run test:rules"
 */
import { readFileSync } from 'node:fs'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { addDoc, collection, deleteDoc, doc, documentId, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, Timestamp, updateDoc, where, writeBatch } from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

const ADMIN = 'admin-uid'
const ALICE = 'alice-uid' // subscribed
const BOB = 'bob-uid' // read-only
const DAY = 24 * 60 * 60 * 1000

let env: RulesTestEnvironment

const authEmail = (phone: string) => `${phone}@phone.broilerhq.app`
const as = (uid: string, phone: string) => env.authenticatedContext(uid, { email: authEmail(phone) }).firestore()
const alice = () => as(ALICE, '01711111111')
const bob = () => as(BOB, '01822222222')
const admin = () => as(ADMIN, '01933333333')

const farmData = () => ({ name: 'North farm', location: 'Gazipur', address: '', createdAt: serverTimestamp(), updatedAt: serverTimestamp() })

beforeAll(async () => {
  env = await initializeTestEnvironment({
    // Own project id, so the tests never clear data of a dev emulator running `demo-broiler`.
    projectId: 'demo-rules-test',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  })
})

afterAll(() => env.cleanup())

beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore()
    await setDoc(doc(db, 'admins', ADMIN), {})
    await setDoc(doc(db, 'users', ALICE), { name: 'Alice', phone: '01711111111', email: null, createdAt: Timestamp.now() })
    await setDoc(doc(db, 'users', BOB), { name: 'Bob', phone: '01822222222', email: null, createdAt: Timestamp.now() })
    await setDoc(doc(db, 'subscriptions', ALICE), {
      type: 'period',
      startsAt: Timestamp.fromMillis(Date.now() - DAY),
      endsAt: Timestamp.fromMillis(Date.now() + 30 * DAY),
      updatedAt: Timestamp.now(),
      updatedBy: ADMIN,
    })
    await setDoc(doc(db, 'users', ALICE, 'farms', 'farm1'), { ...farmData(), createdAt: Timestamp.now(), updatedAt: Timestamp.now() })
    await setDoc(doc(db, 'users', ALICE, 'batches', 'batch1'), {
      farmId: 'farm1', name: 'B1', breed: '', startDate: '2026-09-01', initialQuantity: 1000, status: 'active', note: '',
      createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
    })
  })
})

describe('profiles', () => {
  it('lets a user create their own profile with their own phone', async () => {
    const db = env.authenticatedContext('new-uid', { email: authEmail('01544444444') }).firestore()
    await assertSucceeds(setDoc(doc(db, 'users', 'new-uid'), { name: 'New', phone: '01544444444', email: null, createdAt: serverTimestamp() }))
  })

  it("rejects a profile with someone else's phone", async () => {
    const db = env.authenticatedContext('new-uid', { email: authEmail('01544444444') }).firestore()
    await assertFails(setDoc(doc(db, 'users', 'new-uid'), { name: 'New', phone: '01711111111', email: null, createdAt: serverTimestamp() }))
  })

  it('does not let users change their phone', async () => {
    await assertFails(updateDoc(doc(bob(), 'users', BOB), { phone: '01899999999' }))
    await assertSucceeds(updateDoc(doc(bob(), 'users', BOB), { name: 'Robert' }))
  })

  it("hides other users' profiles", async () => {
    await assertFails(getDoc(doc(bob(), 'users', ALICE)))
    await assertSucceeds(getDoc(doc(admin(), 'users', ALICE)))
  })
})

describe('admin reads', () => {
  it("lets the admin read any user's farm data", async () => {
    await assertSucceeds(getDoc(doc(admin(), 'users', ALICE, 'farms', 'farm1')))
    await assertSucceeds(getDocs(query(collection(admin(), 'users', ALICE, 'batches'), where('farmId', '==', 'farm1'))))
  })

  it("never lets the admin write another user's farm data", async () => {
    await assertFails(addDoc(collection(admin(), 'users', ALICE, 'farms'), farmData()))
    await assertFails(updateDoc(doc(admin(), 'users', ALICE, 'farms', 'farm1'), { name: 'Hacked', updatedAt: serverTimestamp() }))
  })

  it('lets the admin list users, subscriptions and requests', async () => {
    await assertSucceeds(getDocs(query(collection(admin(), 'users'), limit(21))))
    await assertSucceeds(getDocs(query(collection(admin(), 'subscriptions'), limit(21))))
    await assertSucceeds(getDocs(query(collection(admin(), 'paymentRequests'), where('status', '==', 'pending'), limit(21))))
    await assertFails(getDocs(query(collection(bob(), 'users'), limit(21))))
  })
})

describe('farm data', () => {
  it('lets a subscribed user read their own data', async () => {
    await assertSucceeds(getDoc(doc(alice(), 'users', ALICE, 'farms', 'farm1')))
  })

  it('lets a read-only user read but not write', async () => {
    await assertSucceeds(getDoc(doc(bob(), 'users', BOB, 'farms', 'any')))
    await assertFails(addDoc(collection(bob(), 'users', BOB, 'farms'), farmData()))
  })

  it('lets a subscribed user write valid data', async () => {
    await assertSucceeds(addDoc(collection(alice(), 'users', ALICE, 'farms'), farmData()))
  })

  it("blocks writing into someone else's farm data", async () => {
    await assertFails(addDoc(collection(alice(), 'users', BOB, 'farms'), farmData()))
    await assertFails(getDoc(doc(bob(), 'users', ALICE, 'farms', 'farm1')))
  })

  it('denies writes once the subscription has ended', async () => {
    await env.withSecurityRulesDisabled((context) =>
      updateDoc(doc(context.firestore(), 'subscriptions', ALICE), { endsAt: Timestamp.fromMillis(Date.now() - 1000) }),
    )
    await assertFails(addDoc(collection(alice(), 'users', ALICE, 'farms'), farmData()))
  })

  it('denies writes before a scheduled subscription starts', async () => {
    await env.withSecurityRulesDisabled((context) =>
      updateDoc(doc(context.firestore(), 'subscriptions', ALICE), { startsAt: Timestamp.fromMillis(Date.now() + DAY) }),
    )
    await assertFails(addDoc(collection(alice(), 'users', ALICE, 'farms'), farmData()))
  })

  it('denies writes, edits and deletes once the admin revokes access', async () => {
    const farm = doc(alice(), 'users', ALICE, 'farms', 'farm1')
    await assertSucceeds(updateDoc(farm, { name: 'Renamed', updatedAt: serverTimestamp() }))
    await deleteDoc(doc(admin(), 'subscriptions', ALICE))
    await assertFails(updateDoc(farm, { name: 'Again', updatedAt: serverTimestamp() }))
    await assertFails(deleteDoc(farm))
    await assertSucceeds(getDoc(farm))
  })

  it('lets the admin write their own farm data without a subscription', async () => {
    await assertSucceeds(addDoc(collection(admin(), 'users', ADMIN, 'farms'), farmData()))
  })

  it('allows the farm-wide and all-farm reads used by the profit & loss charts', async () => {
    const expenses = collection(alice(), 'users', ALICE, 'expenses')
    await assertSucceeds(getDocs(query(expenses, where('farmId', '==', 'farm1'), orderBy(documentId()), limit(501))))
    await assertSucceeds(getDocs(query(expenses, orderBy(documentId()), limit(501))))
    await assertFails(getDocs(query(collection(bob(), 'users', ALICE, 'expenses'), orderBy(documentId()), limit(501))))
  })

  it('validates record fields and batch ownership', async () => {
    const feeds = collection(alice(), 'users', ALICE, 'feeds')
    const base = { farmId: 'farm1', batchId: 'batch1', date: '2026-09-10', note: null, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }
    await assertSucceeds(addDoc(feeds, { ...base, consumption: 50 }))
    await assertFails(addDoc(feeds, { ...base, consumption: -1 }))
    await assertFails(addDoc(feeds, { ...base, consumption: 5, extra: true }))
    await assertFails(addDoc(feeds, { ...base, batchId: 'missing', consumption: 5 }))
  })
})

describe('billing', () => {
  const requestData = (overrides: Record<string, unknown> = {}) => ({
    userId: BOB, userName: 'Bob', userPhone: '01822222222', bkashLast4: '1234', status: 'pending',
    createdAt: serverTimestamp(), reviewedAt: null, reviewedBy: null, reviewNote: null, ...overrides,
  })

  it('lets users file a pending request for themselves only', async () => {
    await assertSucceeds(addDoc(collection(bob(), 'paymentRequests'), requestData()))
    await assertFails(addDoc(collection(bob(), 'paymentRequests'), requestData({ status: 'approved' })))
    await assertFails(addDoc(collection(bob(), 'paymentRequests'), requestData({ userId: ALICE })))
    await assertFails(addDoc(collection(bob(), 'paymentRequests'), requestData({ bkashLast4: '12a4' })))
  })

  it('never lets users grant themselves access', async () => {
    await assertFails(
      setDoc(doc(bob(), 'subscriptions', BOB), { type: 'lifetime', startsAt: null, endsAt: null, updatedAt: serverTimestamp(), updatedBy: BOB }),
    )
  })

  it('lets the admin grant lifetime access', async () => {
    await assertSucceeds(
      setDoc(doc(admin(), 'subscriptions', BOB), { type: 'lifetime', startsAt: null, endsAt: null, updatedAt: serverTimestamp(), updatedBy: ADMIN }),
    )
  })

  it('approving a request (as the app does) unlocks writing for that user', async () => {
    const ref = await addDoc(collection(bob(), 'paymentRequests'), requestData())
    await assertFails(addDoc(collection(bob(), 'users', BOB, 'farms'), farmData()))

    const adminDb = admin()
    const batch = writeBatch(adminDb)
    batch.update(doc(adminDb, 'paymentRequests', ref.id), { status: 'approved', reviewedAt: serverTimestamp(), reviewedBy: ADMIN })
    batch.set(doc(adminDb, 'subscriptions', BOB), {
      type: 'period',
      startsAt: Timestamp.fromMillis(Date.now() - 1000),
      endsAt: Timestamp.fromMillis(Date.now() + 30 * DAY),
      updatedAt: serverTimestamp(),
      updatedBy: ADMIN,
    })
    await assertSucceeds(batch.commit())

    await assertSucceeds(addDoc(collection(bob(), 'users', BOB, 'farms'), farmData()))
    // A reviewed request can't be reviewed again.
    await assertFails(updateDoc(doc(admin(), 'paymentRequests', ref.id), { status: 'rejected', reviewedAt: serverTimestamp(), reviewedBy: ADMIN }))
  })

  it("lets users read only their own requests and subscription", async () => {
    await addDoc(collection(bob(), 'paymentRequests'), requestData())
    await assertSucceeds(getDocs(query(collection(bob(), 'paymentRequests'), where('userId', '==', BOB), limit(1))))
    await assertFails(getDocs(query(collection(alice(), 'paymentRequests'), where('userId', '==', BOB), limit(1))))
    await assertSucceeds(getDoc(doc(alice(), 'subscriptions', ALICE)))
    await assertFails(getDoc(doc(bob(), 'subscriptions', ALICE)))
  })

  it('lets only the admin review requests', async () => {
    const ref = await addDoc(collection(bob(), 'paymentRequests'), requestData())
    const review = { status: 'approved', reviewedAt: serverTimestamp(), reviewedBy: ADMIN }
    await assertFails(updateDoc(doc(bob(), 'paymentRequests', ref.id), { ...review, reviewedBy: BOB }))
    await assertSucceeds(updateDoc(doc(admin(), 'paymentRequests', ref.id), review))
  })
})
