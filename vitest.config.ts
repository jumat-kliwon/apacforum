import { defineConfig } from 'vitest/config'

// Unit tests for pure helpers only. They import files directly, without Nuxt auto-imports.
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node'
  }
})
