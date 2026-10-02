import type { AuthUser } from '~/services/auth.service'
import { signInWithPhone, signOutUser, signUpWithPhone, watchAuthUser } from '~/services/auth.service'
import { createUserProfile, fetchIsAdmin, fetchUserProfile, updateUserProfile, type NewProfile } from '~/services/users.service'
import type { UserProfile } from '~/types/models'
import { phoneToAuthEmail } from '~/utils/phone'
import type { AppError, RequestStatus } from '~/types/network'

/**
 * The signed-in account: Firebase user, profile doc and admin flag.
 *
 * `init()` (called by the Firebase plugin) follows the auth state; route middleware awaits
 * `whenReady()` so guards never run before the restored session is known.
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const profile = ref<UserProfile | null>(null)
  const isAdmin = ref(false)
  /** Status of loading the session (profile + admin flag) after an auth change. */
  const status = ref<RequestStatus>('idle')
  const error = ref<AppError | null>(null)

  const isSignedIn = computed(() => user.value !== null)
  /** Signed in, but the profile doc is missing (sign-up was interrupted). */
  const needsProfile = computed(() => isSignedIn.value && status.value === 'success' && !profile.value)
  const uid = computed(() => user.value?.uid ?? null)

  let resolveReady: () => void = () => {}
  const ready = new Promise<void>((resolve) => {
    resolveReady = resolve
  })
  let stopWatching: (() => void) | null = null
  // Sign-up triggers both the auth listener and an explicit reload; only the latest may win,
  // or a load that started before the profile doc existed could overwrite it with null.
  let latestLoad = 0

  const loadSession = async (authUser: AuthUser | null) => {
    const load = ++latestLoad
    user.value = authUser
    profile.value = null
    isAdmin.value = false
    error.value = null
    if (!authUser) {
      status.value = 'success'
      return
    }

    status.value = 'loading'
    const [profileResult, adminResult] = await Promise.all([fetchUserProfile(authUser.uid), fetchIsAdmin(authUser.uid)])
    if (load !== latestLoad) return
    if (profileResult.error) {
      error.value = profileResult.error
      status.value = 'error'
      return
    }
    profile.value = profileResult.data
    isAdmin.value = adminResult.data ?? false
    status.value = 'success'
  }

  const init = () => {
    if (stopWatching) return
    stopWatching = watchAuthUser(async (authUser) => {
      await loadSession(authUser)
      resolveReady()
    })
  }

  /** Resolves once the first auth state (signed in or not) has been loaded. */
  const whenReady = () => ready

  const signIn = async (phone: string, password: string) => {
    const result = await signInWithPhone(phone, password)
    if (result.data) await loadSession(result.data)
    return result
  }

  /** Creates the account and its profile doc. */
  const signUp = async (input: NewProfile & { password: string }) => {
    const result = await signUpWithPhone(input.phone, input.password)
    if (result.error) return result
    return completeProfile(result.data.uid, { name: input.name, phone: input.phone, email: input.email })
  }

  /** Writes the profile doc for an account that doesn't have one yet. */
  const completeProfile = async (accountUid: string, input: NewProfile) => {
    const result = await createUserProfile(accountUid, input)
    if (result.error) return result
    await loadSession({ uid: accountUid, email: user.value?.email ?? phoneToAuthEmail(input.phone) })
    return result
  }

  const saveProfile = async (changes: Pick<NewProfile, 'name' | 'email'>) => {
    if (!uid.value || !profile.value) return { data: null, error: null }
    const result = await updateUserProfile(uid.value, changes)
    if (!result.error) profile.value = { ...profile.value, ...changes }
    return result
  }

  const signOut = async () => {
    const result = await signOutUser()
    if (!result.error) await loadSession(null)
    return result
  }

  return {
    user,
    uid,
    profile,
    isAdmin,
    status,
    error,
    isSignedIn,
    needsProfile,
    init,
    whenReady,
    signIn,
    signUp,
    completeProfile,
    saveProfile,
    signOut,
  }
})
