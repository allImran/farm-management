/**
 * Fills the local Auth + Firestore emulators with realistic demo data for UI work: an admin,
 * subscribed / expired / unsubscribed users, farms, batches with every record kind, contacts,
 * payment requests and password-reset requests. Lists are long enough to exercise pagination.
 *
 * Wipes the emulators' current data first, so it can be re-run at any time. Never touches a real
 * Firebase project: every request goes to 127.0.0.1.
 *
 * Usage (emulators running): npm run emulators:seed
 * Every account's password is `123456`.
 */
import { readFileSync } from 'node:fs'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, Timestamp, writeBatch, type DocumentData, type Firestore } from 'firebase/firestore'

const PROJECT_ID: string = JSON.parse(readFileSync('.firebaserc', 'utf8')).projects.default
const AUTH_HOST = 'http://127.0.0.1:9099'
const PASSWORD = '123456'
// Mirrors PHONE_AUTH_EMAIL_DOMAIN in app/constants/auth.ts.
const PHONE_AUTH_EMAIL_DOMAIN = 'phone.broilerhq.app'
const DAY = 24 * 60 * 60 * 1000
const BATCH_DAYS = 35
const TODAY = new Date(new Date().toISOString().slice(0, 10))

// Deterministic randomness so every seed produces the same data.
let seed = 42
const random = () => {
  seed = (seed * 1103515245 + 12345) % 2 ** 31
  return seed / 2 ** 31
}
const between = (min: number, max: number) => min + random() * (max - min)
const intBetween = (min: number, max: number) => Math.floor(between(min, max + 1))
const pick = <T>(items: readonly T[]) => items[Math.floor(random() * items.length)]!
const round = (value: number, digits = 2) => Math.round(value * 10 ** digits) / 10 ** digits

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * DAY)
const isoDate = (date: Date) => date.toISOString().slice(0, 10)
const stamp = (date: Date) => Timestamp.fromDate(date)

// ---------- Firestore writes (batched, rules disabled) ----------

let pending: Array<[string, DocumentData]> = []
let idCounter = 0
const newId = (prefix: string) => `${prefix}-${String(++idCounter).padStart(5, '0')}`

const put = (path: string, data: DocumentData) => {
  pending.push([path, data])
}

const flush = async (db: Firestore) => {
  for (let start = 0; start < pending.length; start += 450) {
    const batch = writeBatch(db)
    for (const [path, data] of pending.slice(start, start + 450)) batch.set(doc(db, path), data)
    await batch.commit()
  }
  const written = pending.length
  pending = []
  return written
}

// ---------- Auth emulator ----------

const authFetch = async (path: string, init: RequestInit = {}) => {
  const response = await fetch(`${AUTH_HOST}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer owner' },
  })
  if (!response.ok) throw new Error(`Auth emulator ${path}: ${response.status} ${await response.text()}`)
  return response
}

const createAuthUser = (uid: string, phone: string, name: string) =>
  authFetch(`/identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts`, {
    method: 'POST',
    body: JSON.stringify({ localId: uid, email: `${phone}@${PHONE_AUTH_EMAIL_DOMAIN}`, password: PASSWORD, displayName: name }),
  })

// ---------- Domain data ----------

const ADMIN_UID = 'admin'

interface SeedUser {
  uid: string
  name: string
  phone: string
  email: string | null
  createdDaysAgo: number
  subscription: 'lifetime' | 'active' | 'expiring' | 'expired' | 'scheduled' | 'none'
}

const MAIN_USERS: SeedUser[] = [
  { uid: 'rahim', name: 'Rahim Uddin', phone: '01711111111', email: 'rahim@example.com', createdDaysAgo: 420, subscription: 'lifetime' },
  { uid: 'karim', name: 'Karim Hossain', phone: '01822222222', email: null, createdDaysAgo: 120, subscription: 'expiring' },
  { uid: 'salma', name: 'Salma Akter', phone: '01933333333', email: 'salma@example.com', createdDaysAgo: 200, subscription: 'expired' },
  { uid: 'jamal', name: 'Jamal Mia', phone: '01544444444', email: null, createdDaysAgo: 3, subscription: 'none' },
  {
    uid: 'long-name',
    name: 'Mohammad Abdur Rahman Chowdhury Talukder',
    phone: '01655555555',
    email: 'a.very.long.email.address.for.testing@example-farms.com.bd',
    createdDaysAgo: 60,
    subscription: 'active',
  },
]

const FIRST_NAMES = ['Abdul', 'Nasima', 'Hasan', 'Rina', 'Faruk', 'Shirin', 'Kamal', 'Mitu', 'Rashed', 'Lipi', 'Sohel', 'Taslima']
const LAST_NAMES = ['Islam', 'Begum', 'Ahmed', 'Khatun', 'Sarkar', 'Mondal', 'Sheikh', 'Biswas']
const SUBSCRIPTION_MIX: SeedUser['subscription'][] = ['active', 'expired', 'none', 'none', 'scheduled', 'lifetime']

// Extra accounts so the admin user list spans several pages.
const EXTRA_USERS: SeedUser[] = Array.from({ length: 34 }, (_, index) => ({
  uid: `user-${String(index + 1).padStart(2, '0')}`,
  name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
  phone: `013${String(10000000 + index * 7919).slice(0, 8)}`,
  email: index % 3 === 0 ? `farmer${index + 1}@example.com` : null,
  createdDaysAgo: intBetween(5, 500),
  subscription: pick(SUBSCRIPTION_MIX),
}))

const subscriptionDoc = (kind: SeedUser['subscription']) => {
  const base = { updatedAt: stamp(TODAY), updatedBy: ADMIN_UID }
  const period = (startOffset: number, endOffset: number) => ({
    ...base,
    type: 'period',
    startsAt: stamp(addDays(TODAY, startOffset)),
    endsAt: stamp(addDays(TODAY, endOffset)),
  })
  switch (kind) {
    case 'lifetime':
      return { ...base, type: 'lifetime', startsAt: null, endsAt: null }
    case 'active':
      return period(-40, 140)
    case 'expiring':
      // Inside EXPIRY_WARNING_DAYS, so the renewal reminder shows.
      return period(-27, 3)
    case 'expired':
      return period(-95, -5)
    case 'scheduled':
      return period(4, 34)
    case 'none':
      return null
  }
}

const seedUser = (user: SeedUser) => {
  put(`users/${user.uid}`, {
    name: user.name,
    phone: user.phone,
    email: user.email,
    createdAt: stamp(addDays(TODAY, -user.createdDaysAgo)),
  })
  const subscription = subscriptionDoc(user.subscription)
  if (subscription) put(`subscriptions/${user.uid}`, subscription)
}

// ---------- Contacts ----------

const CONTACT_TEMPLATES = [
  { name: 'Kazi Feed Mills', types: ['supplier'], notes: 'Feed supplier, delivers on Tuesdays.' },
  { name: 'Aftab Chicks Hatchery', types: ['supplier'], notes: 'Day-old chicks, book 10 days ahead.' },
  { name: 'Dr. Mahbub Alam', types: ['doctor'], notes: 'Upazila livestock officer.' },
  { name: 'Shanto Poultry Traders', types: ['customer'], notes: 'Pays on delivery.' },
  { name: 'Babul Paikar', types: ['customer'], notes: '' },
  { name: 'Rafiq (night guard)', types: ['worker'], notes: '' },
  { name: 'Sumon Medicine Corner', types: ['supplier', 'doctor'], notes: 'Medicines and advice.' },
  { name: 'Dhaka Broiler Wholesale Market Agent — Kawran Bazar Branch Office', types: ['customer', 'other'], notes: 'Very long name to test wrapping on small screens.' },
] as const

interface ContactRefs {
  suppliers: string[]
  customers: string[]
  all: string[]
}

const seedContacts = (uid: string, count: number): ContactRefs => {
  const refs: ContactRefs = { suppliers: [], customers: [], all: [] }
  for (let index = 0; index < count; index++) {
    const template = CONTACT_TEMPLATES[index % CONTACT_TEMPLATES.length]!
    const id = newId('contact')
    const createdAt = stamp(addDays(TODAY, -intBetween(1, 300)))
    put(`users/${uid}/contacts/${id}`, {
      name: index < CONTACT_TEMPLATES.length ? template.name : `${template.name} ${Math.floor(index / CONTACT_TEMPLATES.length) + 1}`,
      phone: `01${intBetween(3, 9)}${String(intBetween(10000000, 99999999))}`,
      address: pick(['Gazipur', 'Savar, Dhaka', 'Mymensingh Sadar', 'Bogura', '']),
      types: [...template.types],
      notes: template.notes,
      createdAt,
      updatedAt: createdAt,
    })
    refs.all.push(id)
    if (template.types.some((type) => type === 'supplier')) refs.suppliers.push(id)
    if (template.types.some((type) => type === 'customer')) refs.customers.push(id)
  }
  return refs
}

// ---------- Farms, batches and records ----------

const record = (uid: string, kind: string, farmId: string, batchId: string | null, date: Date, values: DocumentData) => {
  const createdAt = stamp(new Date(date.getTime() + intBetween(7, 20) * 60 * 60 * 1000))
  put(`users/${uid}/${kind}/${newId(kind.slice(0, 4))}`, {
    farmId,
    batchId,
    date: isoDate(date),
    note: null,
    ...values,
    createdAt,
    updatedAt: createdAt,
  })
}

// Typical broiler average live weight (g) by day of age.
const expectedWeight = (day: number) => 42 + 3.2 * day ** 1.85
// Feed per bird per day (kg) grows roughly linearly; ~3.2 kg per bird over 35 days.
const feedPerBird = (day: number) => 0.012 + 0.0045 * day

const DISEASES = ['Gumboro', 'Newcastle (ND)', 'Coccidiosis', 'CRD', null] as const
const MORTALITY_CAUSES = ['Heat stress', 'Weak chicks', 'Leg problem', 'Respiratory', 'Unknown', null] as const
const MEDICINES = [
  { name: 'ND + IB vaccine', type: 'vaccine', quantity: '1 vial', disease: 'Newcastle (ND)' },
  { name: 'Gumboro vaccine', type: 'vaccine', quantity: '1 vial', disease: 'Gumboro' },
  { name: 'Vitamin C + Electrolyte', type: 'vitamin', quantity: '500 g', disease: null },
  { name: 'Amoxicillin', type: 'antibiotic', quantity: '100 g', disease: 'CRD' },
  { name: 'Toltrazuril', type: 'other', quantity: '250 ml', disease: 'Coccidiosis' },
  { name: 'Virkon S', type: 'disinfectant', quantity: '1 kg', disease: null },
] as const

interface BatchPlan {
  name: string
  startDate: Date
  quantity: number
  status: 'active' | 'completed' | 'cancelled'
  note?: string
}

const seedBatch = (uid: string, farmId: string, plan: BatchPlan, contacts: ContactRefs) => {
  const batchId = newId('batch')
  const createdAt = stamp(plan.startDate)
  put(`users/${uid}/batches/${batchId}`, {
    farmId,
    name: plan.name,
    breed: pick(['Cobb 500', 'Ross 308', 'Hubbard Classic']),
    startDate: isoDate(plan.startDate),
    initialQuantity: plan.quantity,
    status: plan.status,
    note: plan.note ?? '',
    createdAt,
    updatedAt: createdAt,
  })

  // Active batches have records up to yesterday; cancelled ones stop early.
  const elapsed = Math.floor((TODAY.getTime() - plan.startDate.getTime()) / DAY)
  const lastDay = plan.status === 'active' ? Math.min(elapsed - 1, BATCH_DAYS) : plan.status === 'cancelled' ? 12 : BATCH_DAYS
  const supplier = () => (contacts.suppliers.length ? pick(contacts.suppliers) : null)
  const at = (day: number) => addDays(plan.startDate, day)

  let alive = plan.quantity
  let feedKg = 0
  for (let day = 1; day <= lastDay; day++) {
    const deaths = random() < 0.35 ? intBetween(1, day < 7 ? 8 : 4) : 0
    if (deaths) {
      alive -= deaths
      record(uid, 'mortalities', farmId, batchId, at(day), { count: deaths, cause: pick(MORTALITY_CAUSES) })
    }
    const consumption = round(alive * feedPerBird(day) * between(0.92, 1.08), 1)
    feedKg += consumption
    record(uid, 'feeds', farmId, batchId, at(day), {
      consumption,
      note: day % 9 === 0 ? 'New feed bag opened (starter → grower).' : null,
    })
    if (day % 7 === 0 || day === lastDay) {
      record(uid, 'weights', farmId, batchId, at(day), {
        averageWeight: Math.round(expectedWeight(day) * between(0.93, 1.07)),
        sampleSize: random() < 0.8 ? intBetween(10, 30) : null,
      })
    }
  }

  const medicineDays = [5, 9, 14, 18, 24].filter((day) => day <= lastDay)
  for (const day of medicineDays) {
    const medicine = pick(MEDICINES)
    record(uid, 'medicines', farmId, batchId, at(day), { ...medicine, disease: medicine.disease ?? pick(DISEASES) })
  }

  // Running costs (BDT): chicks up front, feed bought in a few lots, then smaller items.
  record(uid, 'expenses', farmId, batchId, at(0), { type: 'chicks', amount: plan.quantity * intBetween(48, 62), contactId: supplier() })
  record(uid, 'expenses', farmId, batchId, at(0), { type: 'litter', amount: intBetween(3000, 6000), contactId: null })
  const feedLots = Math.max(1, Math.ceil(lastDay / 10))
  for (let lot = 0; lot < feedLots; lot++) {
    record(uid, 'expenses', farmId, batchId, at(lot * 10), {
      type: 'feed',
      amount: Math.round((feedKg / feedLots) * intBetween(62, 70)),
      contactId: supplier(),
    })
  }
  record(uid, 'expenses', farmId, batchId, at(Math.min(15, lastDay)), { type: 'medicine', amount: intBetween(4000, 9000), contactId: supplier() })
  record(uid, 'expenses', farmId, batchId, at(lastDay), { type: 'labor', amount: intBetween(8000, 15000), contactId: null })
  record(uid, 'expenses', farmId, batchId, at(lastDay), { type: 'electricity', amount: intBetween(2500, 5000), contactId: null })
  if (random() < 0.5) record(uid, 'expenses', farmId, batchId, at(lastDay), { type: 'transport', amount: intBetween(1500, 4000), contactId: null })

  if (plan.status !== 'completed') return

  // Sold over the last few days by live weight; a good batch makes a profit, a bad one doesn't.
  const saleDays = [BATCH_DAYS - 2, BATCH_DAYS - 1, BATCH_DAYS]
  const pricePerKg = intBetween(140, 185)
  let left = alive
  saleDays.forEach((day, index) => {
    const quantity = index === saleDays.length - 1 ? left : Math.round(alive * between(0.25, 0.4))
    left -= quantity
    const weight = round((quantity * expectedWeight(day) * between(0.95, 1.05)) / 1000, 1)
    const unitPrice = pricePerKg + intBetween(-5, 5)
    record(uid, 'sales', farmId, batchId, at(day), {
      quantity,
      weight,
      unitPrice,
      totalAmount: round(weight * unitPrice),
      contactId: contacts.customers.length ? pick(contacts.customers) : null,
    })
  })
}

interface FarmPlan {
  name: string
  address: string
  /** Completed batches before the current one. */
  history: number
  hasActiveBatch: boolean
  hasCancelledBatch?: boolean
  acceptedExtraFee?: boolean
}

const seedFarm = (uid: string, plan: FarmPlan, contacts: ContactRefs) => {
  const farmId = newId('farm')
  // One batch roughly every 50 days (35 grow-out + clean-out), the newest one running now.
  const cycle = 50
  const firstStart = addDays(TODAY, -(plan.history * cycle + 21))
  const farmCreated = addDays(firstStart, -30)
  put(`users/${uid}/farms/${farmId}`, {
    name: plan.name,
    address: plan.address,
    ...(plan.acceptedExtraFee ? { extraFeeAcceptedAt: stamp(farmCreated) } : {}),
    createdAt: stamp(farmCreated),
    updatedAt: stamp(farmCreated),
  })

  for (let index = 0; index < plan.history; index++) {
    seedBatch(uid, farmId, {
      name: `Batch ${index + 1}`,
      startDate: addDays(firstStart, index * cycle),
      quantity: pick([1000, 1200, 1500, 2000]),
      status: plan.hasCancelledBatch && index === 1 ? 'cancelled' : 'completed',
      note: plan.hasCancelledBatch && index === 1 ? 'Stopped after a disease outbreak in week 2.' : undefined,
    }, contacts)
  }
  if (plan.hasActiveBatch) {
    seedBatch(uid, farmId, {
      name: `Batch ${plan.history + 1}`,
      startDate: addDays(TODAY, -21),
      quantity: 1500,
      status: 'active',
    }, contacts)
  }

  // Farm-level costs: shed setup before the first batch, then upkeep between batches.
  record(uid, 'expenses', farmId, null, farmCreated, { type: 'construction', amount: intBetween(150000, 300000), contactId: null, note: 'Shed roof and walls.' })
  record(uid, 'expenses', farmId, null, addDays(farmCreated, 5), { type: 'equipment', amount: intBetween(30000, 60000), contactId: null, note: 'Feeders, drinkers and brooders.' })
  record(uid, 'expenses', farmId, null, addDays(farmCreated, 8), { type: 'electrical', amount: intBetween(8000, 20000), contactId: null })
  for (let index = 0; index < plan.history; index++) {
    const date = addDays(firstStart, index * cycle + 40)
    record(uid, 'expenses', farmId, null, date, { type: pick(['cleaning', 'water', 'rent', 'fees']), amount: intBetween(1500, 12000), contactId: null })
  }
}

// ---------- Billing & admin queues ----------

const seedAdminQueues = (users: SeedUser[]) => {
  const requestFor = (user: SeedUser, status: 'pending' | 'approved' | 'rejected', daysAgo: number, note: string | null = null) => {
    const createdAt = addDays(TODAY, -daysAgo)
    put(`paymentRequests/${newId('pay')}`, {
      userId: user.uid,
      userName: user.name,
      userPhone: user.phone,
      bkashLast4: String(intBetween(1000, 9999)),
      status,
      createdAt: stamp(createdAt),
      reviewedAt: status === 'pending' ? null : stamp(addDays(createdAt, 1)),
      reviewedBy: status === 'pending' ? null : ADMIN_UID,
      reviewNote: note,
    })
  }

  const [rahim, karim, salma, jamal, longName] = MAIN_USERS as [SeedUser, SeedUser, SeedUser, SeedUser, SeedUser]
  requestFor(jamal, 'pending', 1)
  requestFor(salma, 'pending', 0)
  requestFor(longName, 'pending', 2)
  requestFor(karim, 'approved', 27)
  requestFor(karim, 'rejected', 30, 'No payment found from this number.')
  requestFor(salma, 'approved', 95)
  requestFor(rahim, 'approved', 400, 'Lifetime offer.')
  users.slice(0, 22).forEach((user, index) => requestFor(user, pick(['pending', 'approved', 'approved', 'rejected']), index + 3))

  const resetRequest = (phone: string, status: 'pending' | 'approved' | 'rejected', daysAgo: number) => {
    const createdAt = addDays(TODAY, -daysAgo)
    put(`passwordResetRequests/${phone}`, {
      phone,
      status,
      createdAt: stamp(createdAt),
      reviewedAt: status === 'pending' ? null : stamp(addDays(createdAt, 1)),
      reviewedBy: status === 'pending' ? null : ADMIN_UID,
    })
  }
  resetRequest(salma.phone, 'pending', 0)
  resetRequest(users[0]!.phone, 'pending', 1)
  resetRequest(users[1]!.phone, 'approved', 6)
  resetRequest('01799999999', 'rejected', 10)

  put('config/plan', {
    monthlyPrice: 500,
    extraFarmPrice: 100,
    bkashNumber: '01700000000',
    instructions: 'Send Money to the bKash number above, then enter the last 4 digits of the number you paid from.',
    updatedAt: stamp(addDays(TODAY, -100)),
    updatedBy: ADMIN_UID,
  })
}

// ---------- Main ----------

const main = async () => {
  console.log(`Seeding emulators for project "${PROJECT_ID}"...`)
  const env = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { host: '127.0.0.1', port: 8080 },
  })
  await env.clearFirestore()
  await authFetch(`/emulator/v1/projects/${PROJECT_ID}/accounts`, { method: 'DELETE' })

  const admin: SeedUser = { uid: ADMIN_UID, name: 'Admin', phone: '01700000000', email: null, createdDaysAgo: 500, subscription: 'none' }
  const everyone = [admin, ...MAIN_USERS, ...EXTRA_USERS]
  for (const user of everyone) {
    await createAuthUser(user.uid, user.phone, user.name)
    seedUser(user)
  }
  put(`admins/${ADMIN_UID}`, {})

  // Rahim: the "full" account — three farms (one over the included two), long histories, many contacts.
  const rahimContacts = seedContacts('rahim', 30)
  seedFarm('rahim', { name: 'Gazipur Main Farm', address: 'Kaliakair, Gazipur', history: 8, hasActiveBatch: true, hasCancelledBatch: true }, rahimContacts)
  seedFarm('rahim', { name: 'Savar Shed 2', address: 'Ashulia, Savar, Dhaka', history: 3, hasActiveBatch: true }, rahimContacts)
  seedFarm('rahim', { name: 'Mymensingh Farm', address: '', history: 1, hasActiveBatch: false, acceptedExtraFee: true }, rahimContacts)

  // Karim: one farm, subscription about to expire.
  const karimContacts = seedContacts('karim', 5)
  seedFarm('karim', { name: 'Karim Poultry', address: 'Bhaluka, Mymensingh', history: 2, hasActiveBatch: true }, karimContacts)

  // Salma: expired subscription — existing data is read-only.
  const salmaContacts = seedContacts('salma', 3)
  seedFarm('salma', { name: 'Salma Broiler House', address: 'Sherpur, Bogura', history: 2, hasActiveBatch: false }, salmaContacts)

  // Long-name user: long strings everywhere, to check wrapping on small screens.
  const longContacts = seedContacts('long-name', 8)
  seedFarm('long-name', {
    name: 'Chowdhury Talukder Integrated Broiler & Layer Poultry Farm Complex',
    address: 'Village Uttar Chandpur, Post Office Dakshin Khan, Upazila Kaliakair, District Gazipur 1750',
    history: 1,
    hasActiveBatch: true,
  }, longContacts)

  // Jamal has no data at all (new-user empty states).
  seedAdminQueues(EXTRA_USERS)

  let written = 0
  await env.withSecurityRulesDisabled(async (context) => {
    written = await flush(context.firestore() as unknown as Firestore)
  })
  await env.cleanup()

  console.log(`Done: ${everyone.length} accounts, ${written} Firestore docs.`)
  console.log(`Password for every account: ${PASSWORD}`)
  console.table(
    [admin, ...MAIN_USERS].map((user) => ({ phone: user.phone, name: user.name, role: user.uid === ADMIN_UID ? 'admin' : user.subscription })),
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
