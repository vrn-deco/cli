import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import { jest } from '@jest/globals'

import { Command, runAction } from '@vrn-deco/cli-command'
import { logger } from '@vrn-deco/cli-log'
import { testShared } from '@vrn-deco/cli-shared'
import { PostGit } from '../../common.js'

logger.setLevel('silent')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MOCK_CREATE_ACTION_SCRIPT = path.join(__dirname, '..', '__mocks__', 'mock-create.action.mjs')

// mock parent class CreateAction
const { CreateActionMock } = await import(MOCK_CREATE_ACTION_SCRIPT)
jest.unstable_mockModule('../../create/create.action.js', () => ({
  CreateAction: CreateActionMock,
}))

// mock '@vrn-deco/cli-shared'
const cmdExists = jest.fn(() => true)
const cliSharedModule = await import('@vrn-deco/cli-shared')
jest.unstable_mockModule('@vrn-deco/cli-shared', () => ({
  ...cliSharedModule,
  cmdExists,
}))

// mock execa
const execa = jest.fn().mockImplementation(async () => void 0)
const execaModule = await import('execa')
jest.unstable_mockModule('execa', () => ({
  ...execaModule,
  execa,
}))

// mock removeSync
const removeSyncSpy = jest.spyOn(fs, 'removeSync').mockImplementation(() => void 0)

const { GitCreateAction } = await import('../../create/git-create.action.js')

beforeAll(() => {
  testShared.injectTestEnv()
})
beforeEach(() => {
  cmdExists.mockClear()
  execa.mockClear()
  removeSyncSpy.mockClear()
})
afterAll(() => {
  cmdExists.mockRestore()
  execa.mockRestore()
  removeSyncSpy.mockRestore()
})

// here we only test of GitCreateAction, the parent CreateAction is the mock
// the test case for CreateAction at . /create.action.spec.ts
describe('@vrn-deco/cli-command-boilerplate -> create -> git-create.action.ts', () => {
  test('When git is not installed, will throw a error', async () => {
    expect.assertions(1)
    try {
      cmdExists.mockReturnValueOnce(false)
      await runAction(GitCreateAction)('my-project', undefined, { postGit: PostGit.Retain }, new Command())
    } catch (error) {
      expect(error.message).toContain('`git` is not installed on system')
    }
  })

  test('When --target-boilerplate options is not passed, will throw a error', async () => {
    expect.assertions(1)
    try {
      await runAction(GitCreateAction)('my-project', undefined, { postGit: PostGit.Retain }, new Command())
    } catch (error) {
      expect(error.message).toContain('missing option --target-boilerplate')
    }
  })

  test('When --target-boilerplate options is not a valid git repository address, will throw a error', async () => {
    expect.assertions(1)
    try {
      await runAction(GitCreateAction)(
        'my-project',
        undefined,
        { targetBoilerplate: 'badaddress', postGit: PostGit.Retain },
        new Command(),
      )
    } catch (error) {
      expect(error.message).toContain('option --target-boilerplate is invalid git repository address')
    }
  })

  test('Can exec git clone', async () => {
    await runAction(GitCreateAction)(
      'my-project',
      undefined,
      { targetBoilerplate: 'git@github.com/vrn-deco/test-boilerplate', postGit: PostGit.Retain },
      new Command(),
    )
    expect(execa).toBeCalled()
    expect(execa.mock.calls[0][0]).toBe('git')
    expect(execa.mock.calls[0][1]).toEqual(['clone', 'git@github.com/vrn-deco/test-boilerplate', 'my-project'])
  })

  test('When exec git clone faild, will throw a error', async () => {
    expect.assertions(2)
    execa.mockRejectedValueOnce(new Error('Git clone faild'))
    try {
      await runAction(GitCreateAction)(
        'my-project',
        undefined,
        { targetBoilerplate: 'git@github.com/vrn-deco/test-boilerplate', postGit: PostGit.Retain },
        new Command(),
      )
    } catch (error) {
      expect(execa).toBeCalled()
      expect(error.message).toContain('Git clone faild')
    }
  })

  test('Can exec post-git: remove after git clone', async () => {
    await runAction(GitCreateAction)(
      'my-project',
      undefined,
      { targetBoilerplate: 'git@github.com/vrn-deco/test-boilerplate', postGit: PostGit.Remove },
      new Command(),
    )
    expect(execa).toBeCalledTimes(1)
    expect(removeSyncSpy).toBeCalled()
  })

  test('Can exec post-git: rebuild after git clone', async () => {
    await runAction(GitCreateAction)(
      'my-project',
      undefined,
      { targetBoilerplate: 'git@github.com/vrn-deco/test-boilerplate', postGit: PostGit.Rebuild },
      new Command(),
    )
    expect(execa).toBeCalledTimes(4)
    expect(removeSyncSpy).toBeCalled()
  })
})
