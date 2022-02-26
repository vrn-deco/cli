import { jest } from '@jest/globals'
import { Command } from 'commander'
import { Action, runAction } from '../action.js'

type Name = string
type HelloArguments = [Name]
type HelloOptions = { welcome: boolean }

const initFn = jest.fn()
const execFn = jest.fn((name: Name, welcome = false) => {
  return `Hello, ${name}!${welcome ? ' Welcome!' : ''}`
})
const clearFn = jest.fn()

class HelloAction extends Action<HelloArguments, HelloOptions> {
  async initialize() {
    initFn()
  }
  async execute() {
    execFn(this.arguments[0], this.options.welcome)
  }
  async clear() {
    clearFn()
  }
}

describe('@vrn-deco/cli-command -> action.ts', () => {
  test('No environment variables will throw an exception', async () => {
    expect(runAction(HelloAction)('Hoyoe', { welcome: false }, new Command())).rejects.toThrow(
      'command sub package can be invoked',
    )
  })

  test('Can run action', async () => {
    process.env.VRN_CLI_NAME = 'vrn-cli'
    process.env.VRN_CLI_PACKAGE_NAME = '@vrn-deco/cli'
    process.env.VRN_CLI_VERSION = '1.0.0'
    process.env.VRN_CLI_HOME_PATH = '/home/vrn'
    await expect(runAction(HelloAction)('Hoyoe', { welcome: false }, new Command())).resolves.not.toThrow()
    expect(initFn).toBeCalled()
    expect(execFn).toBeCalledWith('Hoyoe', false)
    expect(execFn).toReturnWith('Hello, Hoyoe!')
    expect(clearFn).toBeCalled()

    await expect(runAction(HelloAction)('Hoyoe', { welcome: true }, new Command())).resolves.not.toThrow()
    expect(execFn).toReturnWith('Hello, Hoyoe! Welcome!')
  })
})
