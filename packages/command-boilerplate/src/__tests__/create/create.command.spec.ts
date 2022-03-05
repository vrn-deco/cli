import { jest } from '@jest/globals'
import { Mode } from '../../common.js'
import { PackageCreateAction } from '../../create/package-create.action.js'

const runAction = jest.fn(() => async () => void 0)

const cliCommandModule = await import('@vrn-deco/cli-command')
jest.unstable_mockModule('@vrn-deco/cli-command', () => ({
  ...cliCommandModule,
  runAction,
}))

const { Command } = cliCommandModule
const { default: createCommand, runActionByMode } = await import('../../create/create.command.js')

describe('@vrn-deco/cli-command-boilerplate -> create -> create.command.ts', () => {
  test('Correct exported', () => {
    expect(createCommand).toBeInstanceOf(Command)
  })

  test('Can run different actions according to mode', async () => {
    await runActionByMode('myapp', './packages', { mode: Mode.Package }, new Command())
    expect(runAction).toHaveBeenLastCalledWith(PackageCreateAction)
  })
})
