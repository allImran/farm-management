/**
 * Sections of the user guide (`/guide`), in page order. `id` is the anchor in the URL, `key` the
 * i18n key under `guide.sections`, and `steps` the keys under `guide.sections.<key>.steps`.
 */
export const GUIDE_SECTIONS = [
  { id: 'getting-started', key: 'gettingStarted', steps: ['signup', 'login', 'preferences', 'install'], hasTip: true },
  { id: 'subscription', key: 'subscription', steps: ['readOnly', 'pay', 'request', 'approval', 'renew'], hasTip: true },
  { id: 'farms', key: 'farms', steps: ['add', 'open', 'farmExpenses', 'delete'], hasTip: false },
  { id: 'batches', key: 'batches', steps: ['create', 'stats', 'status', 'dashboard'], hasTip: false },
  { id: 'records', key: 'records', steps: ['feeds', 'mortalities', 'weights', 'medicines', 'expenses', 'sales'], hasTip: true },
  { id: 'reports', key: 'reports', steps: ['charts', 'batch', 'farm', 'whatIf'], hasTip: false },
  { id: 'contacts', key: 'contacts', steps: ['add', 'types', 'delete'], hasTip: false },
  { id: 'account', key: 'account', steps: ['profile', 'subscription', 'logout'], hasTip: false },
] as const

export type GuideSectionKey = (typeof GUIDE_SECTIONS)[number]['key']

/** Anchor of the FAQ block, which follows the sections. */
export const GUIDE_FAQ_ID = 'faq'

/** Questions in the FAQ, as i18n keys under `guide.faq.items`. */
export const GUIDE_FAQ_KEYS = ['fcr', 'mortality', 'deleteBatch', 'privacy', 'devices', 'password'] as const
