import { jest } from '@jest/globals'
import { logger } from '@vrn-deco/cli-log'

// disabled logger
logger.setLevel('silent')

const readConfig = jest.fn()
const updateConfig = jest.fn()
const queryPackageLatestVersion = jest.fn(async () => '1.0.0')

const configHelper = await import('@vrn-deco/cli-config-helper')
const npmHelper = await import('@vrn-deco/cli-npm-helper')
jest
  .unstable_mockModule('@vrn-deco/cli-config-helper', () => ({
    ...configHelper,
    readConfig,
    updateConfig,
  }))
  .unstable_mockModule('@vrn-deco/cli-npm-helper', () => ({
    ...npmHelper,
    queryPackageLatestVersion,
  }))

const { checkUpdate } = await import('../index.js')

const logSpy = jest.spyOn(console, 'log')

afterEach(() => {
  readConfig.mockReset()
  updateConfig.mockReset()
  queryPackageLatestVersion.mockReset()
  logSpy.mockReset()
})

afterAll(() => {
  logSpy.mockRestore()
})

describe('@vrn-deco/cli-check-update', () => {
  beforeAll(() => {
    process.env.VRN_CLI_PACKAGE_NAME = '@vrn-deco/cli'
    process.env.VRN_CLI_VERSION = '1.0.0'
  })

  test('When config.checkUpdateEnabled is disabled, not check upate', async () => {
    readConfig.mockReturnValueOnce({ checkUpdateEnabled: false })
    await expect(checkUpdate()).resolves.toBeUndefined()
    expect(updateConfig).not.toBeCalled()
  })

  test('When config.checkUpdateLastTime is not expired, not check upate', async () => {
    readConfig.mockReturnValueOnce({ checkUpdateEnabled: true, checkUpdateLastTime: Date.now() })
    await expect(checkUpdate()).resolves.toBeUndefined()
    expect(updateConfig).not.toBeCalled()
  })

  test('When current version is latest version, update only config.checkUpdateLastTime', async () => {
    readConfig.mockReturnValueOnce({ checkUpdateEnabled: true })
    await expect(checkUpdate()).resolves.toBeUndefined()
    expect(logSpy).not.toBeCalled()
    expect(updateConfig).toBeCalled()
  })

  test('When current version is less than latest version, print log and update config.checkUpdateLastTime', async () => {
    readConfig.mockReturnValueOnce({ checkUpdateEnabled: true })
    queryPackageLatestVersion.mockReturnValueOnce(Promise.resolve('1.0.1'))
    await expect(checkUpdate()).resolves.toBeUndefined()
    expect(logSpy).toBeCalled()
    expect(updateConfig).toBeCalled()
  })

  test('Failure to check updates does not throw an error', async () => {
    readConfig.mockReturnValueOnce({ checkUpdateEnabled: true })
    queryPackageLatestVersion.mockReturnValueOnce(Promise.reject(new Error('BOOM')))
    // still resolved
    await expect(checkUpdate()).resolves.toBeUndefined()
    expect(updateConfig).not.toBeCalled()
  })
})
