import { describe, expect, it, vi } from 'vitest'

import { DistTag } from '../common.js'

const execaMock = vi.fn().mockImplementation(async () => void 0)
const cmdExistsMock = vi.fn().mockImplementation(() => true)

vi.mock('execa', () => ({
  execa: execaMock,
}))
vi.mock('@vrn-deco/cli-shared', async () => {
  const m = await vi.importActual<typeof import('@vrn-deco/cli-shared')>('@vrn-deco/cli-shared')
  return {
    ...m,
    cmdExists: cmdExistsMock,
  }
})

const { NPMRegistry, PackageManager } = await import('@vrn-deco/cli-shared')
const { installPackage } = await import('../install.js')

const TEST_PACKAGE_NAME = '@ombro/logger'

describe('@vrn-deco/cli-npm-helper -> install.ts', () => {
  it('Arg name is required', async () => {
    expect.assertions(1)
    await expect(installPackage({ name: '' })).rejects.toThrow()
  })

  it('Specified packageManager must be installed', async () => {
    expect.assertions(1)
    cmdExistsMock.mockReturnValueOnce(false)
    await expect(installPackage({ name: TEST_PACKAGE_NAME, packageManager: PackageManager.Yarn })).rejects.toThrow()
  })

  it('Can install package', async () => {
    await installPackage({ name: TEST_PACKAGE_NAME, packageManager: PackageManager.PNPM, registry: NPMRegistry.NPM })
    expect(execaMock).toBeCalled()
    expect(execaMock.mock.calls[0][0]).toBe(PackageManager.PNPM)
    expect(execaMock.mock.calls[0][1]).toEqual(['add', TEST_PACKAGE_NAME, '--registry', NPMRegistry.NPM])

    await installPackage({ name: TEST_PACKAGE_NAME, versionOrDistTag: DistTag.Next })
    expect(execaMock.mock.calls[1][0]).toBe(PackageManager.NPM)
    expect(execaMock.mock.calls[1][1]).toEqual([
      'install',
      `${TEST_PACKAGE_NAME}@${DistTag.Next}`,
      '--registry',
      NPMRegistry.NPM,
    ])
  })

  it('Installation failure will throw an error', async () => {
    execaMock.mockImplementationOnce(async () => Promise.reject())
    expect.assertions(2)
    process.env.VRN_CLI_DEBUG_ENABLED = 'off'
    await expect(installPackage({ name: TEST_PACKAGE_NAME })).rejects.toThrow('dependency installation failed')

    const error = new Error('BOOM')
    execaMock.mockImplementationOnce(async () => Promise.reject(error))
    process.env.VRN_CLI_DEBUG_ENABLED = 'on'
    await expect(installPackage({ name: TEST_PACKAGE_NAME })).rejects.toThrow(error)
  })
})
