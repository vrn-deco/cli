import { beforeAll, describe, expect, it, vi } from 'vitest'

import type { BaseConfig } from '@vrn-deco/cli-config-helper'
import { logger } from '@vrn-deco/cli-log'
import { NPMRegistry, PackageManager, testShared } from '@vrn-deco/cli-shared'

logger.setLevel('silent')

let originConfig: BaseConfig = {
  npmRegistry: NPMRegistry.NPM,
  packageManager: PackageManager.NPM,
  checkUpdateEnabled: true,
}

const prompt = vi.fn(async () => ({}))
const readConfig = vi.fn(() => originConfig)
const updateConfig = vi.fn((config: Partial<BaseConfig>) => {
  originConfig = { ...originConfig, ...config }
})

vi.mock('@vrn-deco/cli-command', async () => {
  const commandModule = await vi.importActual<typeof import('@vrn-deco/cli-command')>('@vrn-deco/cli-command')
  return {
    ...commandModule,
    prompt,
  }
})
vi.mock('@vrn-deco/cli-config-helper', async () => {
  const configHelperModule = await vi.importActual<typeof import('@vrn-deco/cli-config-helper')>(
    '@vrn-deco/cli-config-helper',
  )
  return {
    ...configHelperModule,
    readConfig,
    updateConfig,
  }
})

const { Command, runAction } = await import('@vrn-deco/cli-command')
const { ConfigAction } = await import('../action.js')

beforeAll(() => {
  testShared.injectTestEnv()
})

describe('@vrn-deco/cli-command-config -> action.ts', () => {
  it('Can read current config', async () => {
    await runAction(ConfigAction)({}, new Command())
    expect(readConfig).toBeCalled()
  })

  it('Can update packageManager field in interactive mode', async () => {
    // selectField
    prompt.mockResolvedValueOnce({ field: 'packageManager' })
    // editItem
    prompt.mockResolvedValueOnce({ packageManager: PackageManager.Yarn })
    await runAction(ConfigAction)({}, new Command())
    expect(originConfig.packageManager).toBe(PackageManager.Yarn)
  })

  it('Can update npmRegistry field in interactive mode', async () => {
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

  it('Can update checkUpdateEnabled field in interactive mode', async () => {
    prompt.mockResolvedValueOnce({ field: 'checkUpdateEnabled' })
    prompt.mockResolvedValueOnce({ yes: false })
    await runAction(ConfigAction)({}, new Command())
    expect(originConfig.checkUpdateEnabled).toBe(false)
  })
})
