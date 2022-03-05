import os from 'node:os'
import path from 'node:path'
import fs from 'fs-extra'
import { jest } from '@jest/globals'

import { PackageManager, testShared } from '@vrn-deco/cli-shared'
import { readConfig, updateConfig, writeConfig } from '../index.js'

const TEST_HOME_PATH = path.join(os.homedir(), '.vrn-deco.test')

afterAll(() => {
  fs.pathExistsSync(TEST_HOME_PATH) && fs.removeSync(TEST_HOME_PATH)
})

describe('@vrn-deco/cli-config-helper -> index.ts', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  test('can only be used after initalizing environment variables', () => {
    expect(() => readConfig()).toThrow('be after environment variables initialization')
    // and then inject into the environment
    testShared.injectTestEnv()
  })

  test('can read config', () => {
    const config = readConfig()
    expect(config).toBeDefined()
    expect(config.npmRegistry).toMatch(/^http/)
    expect(config.packageManager).toBe(PackageManager.NPM)
    expect(config.checkUpdateEnabled).toBe(true)
  })

  test('can write config', () => {
    const config = readConfig()
    config.npmRegistry = 'https://registry.npm.cphayim.me'
    config.packageManager = PackageManager.Yarn
    config.checkUpdateEnabled = false
    expect(() => writeConfig(config)).not.toThrow()
    expect(readConfig()).toEqual(config)
  })

  test('can update config', () => {
    expect(() => updateConfig({ packageManager: PackageManager.PNPM })).not.toThrow()
    expect(readConfig().packageManager).toBe(PackageManager.PNPM)
  })
})
