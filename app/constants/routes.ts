/** App route paths, referenced instead of string literals. */
export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  farms: '/farms',
  farm: (farmId: string) => `/farms/${farmId}`,
  batch: (batchId: string) => `/batches/${batchId}`,
  contacts: '/contacts',
  account: '/account',
  admin: '/admin',
} as const
