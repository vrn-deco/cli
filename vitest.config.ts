import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    root: __dirname,
    environment: 'node',
    include: [
      'packages/**/__tests__/**/*.ts',
      'packages/**/*.{spec,test}.ts',
      '!**/*.d.ts', //
    ],
    coverage: {
      include: ['packages/**/src/**/*.ts'],
      reporter: ['text', 'lcov'],
      thresholds: {
        statements: 90,
      },
    },
  },
})
