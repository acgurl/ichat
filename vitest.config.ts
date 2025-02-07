import { defineConfig } from 'vitest/config'
import { configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default defineConfig({
  test: {
    ...configDefaults,
  },
  ...viteConfig as any
})
