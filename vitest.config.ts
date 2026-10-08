import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Unit tests import app code through Nuxt's `~` alias.
export default defineConfig({
  resolve: {
    alias: { '~': fileURLToPath(new URL('./app', import.meta.url)) },
  },
})
