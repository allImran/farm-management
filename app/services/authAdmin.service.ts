import { clearGoogleAccessToken, getGoogleAccessToken } from './googleAuth.service'

/**
 * Admin operations on Firebase Auth accounts through Google's Identity Toolkit REST API (what
 * the Admin SDK uses under the hood), called from the browser with the admin's Google token.
 * Against the Auth emulator the emulator's fixed `owner` token is used instead.
 */

const API_HOST = 'https://identitytoolkit.googleapis.com'
const EMULATOR_HOST = 'http://127.0.0.1:9099/identitytoolkit.googleapis.com'
const EMULATOR_TOKEN = 'owner'

export interface AuthAdminConfig {
  projectId: string
  useEmulator: boolean
}

const failure = (code: string) => Object.assign(new Error(code), { code })

const call = async <T>(config: AuthAdminConfig, token: string, action: 'lookup' | 'update', body: object) => {
  const host = config.useEmulator ? EMULATOR_HOST : API_HOST
  try {
    return await $fetch<T>(`${host}/v1/projects/${config.projectId}/accounts:${action}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body,
    })
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode
    if (status === 401) {
      clearGoogleAccessToken()
      throw failure('google-sign-in-failed')
    }
    // The Google account has no role that may manage this project's users.
    if (status === 403) throw failure('google-permission-denied')
    throw error
  }
}

/**
 * Starts an authorized session. The Google token is requested synchronously, so the sign-in
 * popup (if one is needed) still counts as opened by the admin's click.
 *
 * @returns `findUid(email)` (`null` when no account uses it) and `setPassword(uid, password)`,
 *          which also signs the account out on every device.
 */
export const authorizeAuthAdmin = async (config: AuthAdminConfig) => {
  const token = await (config.useEmulator ? Promise.resolve(EMULATOR_TOKEN) : getGoogleAccessToken())

  const findUid = async (email: string) => {
    const found = await call<{ users?: { localId: string }[] }>(config, token, 'lookup', { email: [email] })
    return found.users?.[0]?.localId ?? null
  }

  // Sessions issued before `validSince` stop working, so nobody keeps a session from before the reset.
  const setPassword = (uid: string, password: string) =>
    call(config, token, 'update', { localId: uid, password, validSince: String(Math.floor(Date.now() / 1000)) })

  return { findUid, setPassword }
}
