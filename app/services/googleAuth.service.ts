/**
 * Google sign-in for the admin (Google Identity Services token flow). The resulting access token
 * lets the browser call Google's Identity Toolkit admin API as the Google account that owns the
 * Firebase project; this replaces a Cloud Function, which the free Spark plan doesn't offer.
 *
 * Google, not this app, decides what the token may do: only accounts with a role such as Owner
 * or Firebase Authentication Admin on the project can manage users with it.
 */

const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client'
/** Narrowest scope that covers reading and updating Firebase Auth users. */
const IDENTITY_TOOLKIT_SCOPE = 'https://www.googleapis.com/auth/identitytoolkit'
/** Refresh a little before Google's expiry so a token never dies mid-request. */
const EXPIRY_MARGIN_MS = 60_000

interface TokenResponse {
  access_token?: string
  expires_in?: number
}

interface TokenClient {
  callback: (response: TokenResponse) => void
  error_callback: (error: { type: string }) => void
  requestAccessToken: () => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: { client_id: string; scope: string; callback: (response: TokenResponse) => void }) => TokenClient
        }
      }
    }
  }
}

let scriptLoading: Promise<void> | null = null
let tokenClient: TokenClient | null = null
let cachedToken: { value: string; expiresAt: number } | null = null

const signInFailed = () => Object.assign(new Error('Google sign-in failed'), { code: 'google-sign-in-failed' })

const loadScript = () =>
  (scriptLoading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GIS_SCRIPT_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptLoading = null
      reject(signInFailed())
    }
    document.head.appendChild(script)
  }))

/**
 * Loads Google's sign-in library ahead of time. Browsers only allow the sign-in popup when it
 * opens straight from a click, so it must be ready before the admin confirms.
 */
export const prepareGoogleSignIn = async (clientId: string) => {
  await loadScript()
  tokenClient ??= window.google!.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: IDENTITY_TOOLKIT_SCOPE,
    callback: () => {},
  })
}

/**
 * A Google access token for the Identity Toolkit API, from cache or a sign-in popup. Call it
 * from the click handler before any other `await`, after `prepareGoogleSignIn()` has finished.
 *
 * @throws `google-sign-in-failed` when the library isn't loaded, the popup is blocked or closed,
 *         or the admin declines.
 */
export const getGoogleAccessToken = (): Promise<string> => {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return Promise.resolve(cachedToken.value)
  const client = tokenClient
  if (!client) return Promise.reject(signInFailed())
  return new Promise((resolve, reject) => {
    client.callback = (response) => {
      if (!response.access_token) return reject(signInFailed())
      const lifetimeMs = (response.expires_in ?? 0) * 1000
      cachedToken = { value: response.access_token, expiresAt: Date.now() + lifetimeMs - EXPIRY_MARGIN_MS }
      resolve(response.access_token)
    }
    client.error_callback = () => reject(signInFailed())
    client.requestAccessToken()
  })
}

/** Forgets the cached token (e.g. after Google rejected it), so the next call asks again. */
export const clearGoogleAccessToken = () => {
  cachedToken = null
}
