import fs from 'fs-extra'
import { jest } from '@jest/globals'
import { logger } from '@vrn-deco/cli-log'
import { SwitchStatus } from '@vrn-deco/cli-shared'

logger.setLevel('silent')

const rootCheck = jest.fn()
jest.unstable_mockModule('root-check', () => ({
  default: rootCheck,
}))

const { initialEnv, checkUserHome, checkNodeVersion, printLOGO, setLogLevel, rootDemotion } = await import(
  '../prepare.js'
)

describe('@vrn-deco/cli -> prepare.ts', () => {
  test('When user home directory is not exists, will throw a error', () => {
    const spy = jest.spyOn(fs, 'pathExistsSync').mockReturnValueOnce(false)
    expect(checkUserHome).toThrow('home directory does not exist')
    spy.mockRestore()
  })

  test('Can initialize the necessary environment variables', () => {
    initialEnv()
    expect(process.env.VRN_CLI_DEBUG_ENABLED).toBe(SwitchStatus.Off)
    expect(process.env.VRN_CLI_NAME).toBe('vrn-cli')
    expect(process.env.VRN_CLI_PACKAGE_NAME).toBe('@vrn-deco/cli')
  })

  test('When local Node.js version less than lowest requirements, will throw a error', () => {
    // process.version is a read-only property,
    // so we override the minimum requirements set in the previous case
    process.env.VRN_CLI_LOWEST_NODE_VERSION = '^100.0.0'
    expect(checkNodeVersion).toThrow('Please update your Node.js version')
  })

  test('Can print logo', () => {
    const clearSpy = jest.spyOn(logger, 'clearConsole').mockImplementationOnce(() => void 0)
    const logSpy = jest.spyOn(console, 'log').mockImplementationOnce(() => void 0)
    printLOGO()
    expect(clearSpy).toHaveBeenCalled()
    expect(logSpy).toHaveBeenCalled()
    clearSpy.mockRestore()
    logSpy.mockRestore()
  })

  test('Can set global log level', () => {
    const setLevelSpy = jest.spyOn(logger, 'setLevel').mockImplementation(() => void 0)
    process.env.VRN_CLI_DEBUG_ENABLED = SwitchStatus.On
    setLogLevel()
    expect(setLevelSpy).toBeCalledWith('verbose')
    process.env.VRN_CLI_DEBUG_ENABLED = SwitchStatus.Off
    setLogLevel()
    expect(setLevelSpy).toBeCalledWith('info')
    setLevelSpy.mockRestore()
  })

  test('Demotion when executed with sudo', () => {
    rootDemotion()
    expect(rootCheck).not.toBeCalled()
    process.env.SUDO_USER = 'root'
    rootDemotion()
    expect(rootCheck).toBeCalled()
  })
})
