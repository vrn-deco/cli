import { describe, expect, it, vi } from 'vitest'

import { Mode } from '../../common.js'

const runAction = vi.fn(() => async () => void 0)
vi.mock('@vrn-deco/cli-command', async () => {
  const cliCommandModule = await vi.importActual<typeof import('@vrn-deco/cli-command')>('@vrn-deco/cli-command')
  return {
    ...cliCommandModule,
    runAction,
  }
})

const { Command } = await import('@vrn-deco/cli-command')
const { default: createCommand, runActionByMode } = await import('../../create/create.command.js')
const { PackageCreateAction } = await import('../../create/package-create.action.js')
const { HTTPCreateAction } = await import('../../create/http-create.action.js')
const { GitCreateAction } = await import('../../create/git-create.action.js')

describe('@vrn-deco/cli-command-boilerplate -> create -> create.command.ts', () => {
  it('Correct exported', () => {
    expect(createCommand).toBeInstanceOf(Command)
  })

  it('Can run different actions according to mode', async () => {
    await runActionByMode('myapp', './packages', { mode: Mode.Package }, new Command())
    expect(runAction).toHaveBeenLastCalledWith(PackageCreateAction)

    await runActionByMode('myapp', './packages', { mode: Mode.Http }, new Command())
    expect(runAction).toHaveBeenLastCalledWith(HTTPCreateAction)

    await runActionByMode('myapp', './packages', { mode: Mode.Git }, new Command())
    expect(runAction).toHaveBeenLastCalledWith(GitCreateAction)
  })
})
