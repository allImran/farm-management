import { initializeApp, getApps } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { ROUTES } from '~/constants/routes'
import { configureNetwork } from '~/services/network'

/**
 * Initializes Firebase once in the browser, wires the network layer (translated errors,
 * sign-out on expired sessions) and starts listening to the auth state.
 */
export default defineNuxtPlugin({
  name: 'firebase',
  dependsOn: ['i18n:plugin'],
  setup(nuxtApp) {
    const config = useRuntimeConfig().public

    if (!getApps().length) {
      initializeApp({
        apiKey: config.firebaseApiKey,
        authDomain: config.firebaseAuthDomain,
        projectId: config.firebaseProjectId,
        storageBucket: config.firebaseStorageBucket,
        messagingSenderId: config.firebaseMessagingSenderId,
        appId: config.firebaseAppId,
      })

      // Nuxt parses the env value, so 'true' arrives as a boolean.
      if (String(config.firebaseUseEmulators) === 'true') {
        connectAuthEmulator(getAuth(), 'http://127.0.0.1:9099', { disableWarnings: true })
        connectFirestoreEmulator(getFirestore(), '127.0.0.1', 8080)
      }
    }

    const authStore = useAuthStore(nuxtApp.$pinia)

    configureNetwork({
      translate: (key) => nuxtApp.$i18n.t(key),
      onAuthExpired: async () => {
        await authStore.signOut()
        await navigateTo(ROUTES.login)
      },
    })

    authStore.init()
  },
})
