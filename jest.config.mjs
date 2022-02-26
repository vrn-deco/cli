import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const config = {
  rootDir: __dirname,
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['@swc/jest'],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // ESM import ness
  },
  testMatch: [
    '<rootDir>/packages/**/__tests__/**/*.ts',
    '<rootDir>/packages/**/*.(spec|test).ts',
    '!**/*.d.ts', //
  ],
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  collectCoverageFrom: ['packages/**/src/**/*.ts'],
}

export default config
