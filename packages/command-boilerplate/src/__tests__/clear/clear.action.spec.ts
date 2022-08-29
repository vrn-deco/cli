import fs from 'fs-extra'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { Command, runAction } from '@vrn-deco/cli-command'
import { logger } from '@vrn-deco/cli-log'
import { testShared } from '@vrn-deco/cli-shared'

logger.setLevel('silent')

// mock fs.existsSync and fs.removeSync
const fsExistsSyncSpy = vi.spyOn(fs, 'existsSync').mockImplementation(() => true)
const fsRemoveSyncSpy = vi.spyOn(fs, 'removeSync').mockImplementation(() => void 0)

const { ClearAction } = await import('../../clear/clear.action.js')

beforeAll(() => {
  testShared.injectTestEnv()
})

beforeEach(() => {
  fsExistsSyncSpy.mockClear()
  fsRemoveSyncSpy.mockClear()
})

afterAll(() => {
  fsExistsSyncSpy.mockRestore()
  fsRemoveSyncSpy.mockRestore()
})

describe('@vrn-deco/cli-command-boilerplate -> clear -> clear.action.ts', () => {
  it('should be confirmed and cleaned cache', async () => {
    await runAction(ClearAction)(new Command())
    expect(fsExistsSyncSpy).toBeCalled()
    expect(fsRemoveSyncSpy).toBeCalled()
  })
})
