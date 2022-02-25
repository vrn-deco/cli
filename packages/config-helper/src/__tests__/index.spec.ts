import os from 'node:os'
import path from 'node:path'
import fs from 'fs-extra'
import { jest } from '@jest/globals'

import { PackageManager } from '@vrn-deco/cli-shared'
import { readConfig, updateConfig, writeConfig } from '../index.js'

const TEST_HOME_PATH = path.join(os.homedir(), '.vrn-deco.test')

afterAll(() => {
  fs.pathExistsSync(TEST_HOME_PATH) && fs.removeSync(TEST_HOME_PATH)
})

describe('@vrn-deco/cli-config-helper -> index.ts', () => {
  beforeAll(() => {
    //
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  test('can only be used after initalizing environment variables', () => {
    expect(() => readConfig()).toThrow('be after environment variables initialization')
  })

  test('can read config', () => {
    process.env.VRN_CLI_HOME_PATH = TEST_HOME_PATH
    const config = readConfig()
    expect(config).toBeDefined()
    expect(config.npmRegistry).toMatch(/^http/)
    expect(config.packageManager).toBe(PackageManager.NPM)
    expect(config.checkUpdateEnabled).toBe(true)
  })

  test('can write config', () => {
    process.env.VRN_CLI_HOME_PATH = TEST_HOME_PATH
    const config = readConfig()
    config.npmRegistry = 'https://registry.npm.cphayim.me'
    config.packageManager = PackageManager.Yarn
    config.checkUpdateEnabled = false
    expect(() => writeConfig(config)).not.toThrow()
    expect(readConfig()).toEqual(config)
  })

  test('can update config', () => {
    process.env.VRN_CLI_HOME_PATH = TEST_HOME_PATH
    expect(() => updateConfig({ packageManager: PackageManager.PNPM })).not.toThrow()
    expect(readConfig().packageManager).toBe(PackageManager.PNPM)
  })
})
