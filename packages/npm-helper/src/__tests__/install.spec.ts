import { jest } from '@jest/globals'
import { NPMRegistry, PackageManager } from '@vrn-deco/cli-shared'

import { DistTag } from '../common.js'

const execaMock = jest.fn().mockImplementation(async () => void 0)
const cmdExistsMock = jest.fn().mockImplementation(() => true)

jest
  .unstable_mockModule('execa', () => ({
    execa: execaMock,
  }))
  .unstable_mockModule('@vrn-deco/cli-shared', () => ({
    cmdExists: cmdExistsMock,
    NPMRegistry,
    PackageManager,
  }))

const { installPackage } = await import('../install.js')

const TEST_PACKAGE_NAME = '@ombro/logger'

describe('@vrn-deco/cli-npm-helper -> install.ts', () => {
  test('Arg name is required', async () => {
    expect.assertions(1)
    await expect(installPackage({ name: '' })).rejects.toThrow()
  })

  test('Specified packageManager must be installed', async () => {
    expect.assertions(1)
    cmdExistsMock.mockReturnValueOnce(false)
    await expect(installPackage({ name: TEST_PACKAGE_NAME, packageManager: PackageManager.Yarn })).rejects.toThrow()
  })

  test('Can install package', async () => {
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

  test('Installation failure will throw an error', async () => {
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
