import { jest } from '@jest/globals'

import { logger } from '@vrn-deco/cli-log'
import { NPMRegistry, PackageManager, testShared } from '@vrn-deco/cli-shared'
import { BaseConfig } from '@vrn-deco/cli-config-helper'
import { Command, runAction } from '@vrn-deco/cli-command'

logger.setLevel('silent')

let originConfig: BaseConfig = {
  npmRegistry: NPMRegistry.NPM,
  packageManager: PackageManager.NPM,
  checkUpdateEnabled: true,
}

const prompt = jest.fn(async () => ({}))
const readConfig = jest.fn(() => originConfig)
const updateConfig = jest.fn((config: Partial<BaseConfig>) => {
  originConfig = { ...originConfig, ...config }
})

const commandModule = await import('@vrn-deco/cli-command')
const configHelperModule = await import('@vrn-deco/cli-config-helper')
jest.unstable_mockModule('@vrn-deco/cli-command', () => ({
  ...commandModule,
  prompt,
}))
jest.unstable_mockModule('@vrn-deco/cli-config-helper', () => ({
  ...configHelperModule,
  readConfig,
  updateConfig,
}))

const { ConfigAction } = await import('../action.js')

beforeAll(() => {
  testShared.injectTestEnv()
})

describe('@vrn-deco/cli-command-config -> action.ts', () => {
  test('Can read current config', async () => {
    await runAction(ConfigAction)({}, new Command())
    expect(readConfig).toBeCalled()
  })

  test('Can update packageManager field in interactive mode', async () => {
    // selectField
    prompt.mockResolvedValueOnce({ field: 'packageManager' })
    // editItem
    prompt.mockResolvedValueOnce({ packageManager: PackageManager.Yarn })
    await runAction(ConfigAction)({}, new Command())
    expect(originConfig.packageManager).toBe(PackageManager.Yarn)
  })

  test('Can update npmRegistry field in interactive mode', async () => {
    prompt.mockResolvedValueOnce({ field: 'npmRegistry' })
    prompt.mockResolvedValueOnce({ npmRegistry: NPMRegistry.TAOBAO })
    await runAction(ConfigAction)({}, new Command())
    expect(originConfig.npmRegistry).toBe(NPMRegistry.TAOBAO)

    const CUSTOME_REGISTRY = 'https://registry.npm.vrndeco.cn'
    prompt.mockResolvedValueOnce({ field: 'npmRegistry' })
    prompt.mockResolvedValueOnce({ npmRegistry: 'custom', custom: CUSTOME_REGISTRY })
    await runAction(ConfigAction)({}, new Command())
    expect(originConfig.npmRegistry).toBe(CUSTOME_REGISTRY)
  })

  test('Can update checkUpdateEnabled field in interactive mode', async () => {
    prompt.mockResolvedValueOnce({ field: 'checkUpdateEnabled' })
    prompt.mockResolvedValueOnce({ yes: false })
    await runAction(ConfigAction)({}, new Command())
    expect(originConfig.checkUpdateEnabled).toBe(false)
  })
})
