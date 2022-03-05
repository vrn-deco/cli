import fs from 'fs-extra'
import { jest } from '@jest/globals'
import { Boilerplate } from '@vrn-deco/boilerplate-protocol'

import { Command, runAction } from '@vrn-deco/cli-command'
import { logger } from '@vrn-deco/cli-log'
import { testShared } from '@vrn-deco/cli-shared'

logger.setLevel('silent')

const prompt = jest.fn().mockRejectedValue(new Error('Deliberate Mistakes'))

const cliCommandModule = await import('@vrn-deco/cli-command')
jest.unstable_mockModule('@vrn-deco/cli-command', () => ({
  ...cliCommandModule,
  prompt,
}))

const mkdirpSyncSpy = jest.spyOn(fs, 'mkdirpSync').mockImplementation(() => void 0)
const pathExistsSyncSpy = jest.spyOn(fs, 'pathExistsSync').mockImplementation(() => true)
const { CreateAction } = await import('../../create/create.action.js')

beforeAll(() => {
  testShared.injectTestEnv()
})
beforeEach(() => {
  mkdirpSyncSpy.mockClear()
  pathExistsSyncSpy.mockClear()
})
afterAll(() => {
  mkdirpSyncSpy.mockRestore()
  pathExistsSyncSpy.mockRestore()
})

describe('@vrn-deco/cli-command-boilerplate -> create -> create.action.ts', () => {
  test('When folderName is invalid, will throw a error', async () => {
    expect.assertions(1)
    try {
      await runAction(CreateAction)('一个亿的项目', undefined, {}, new Command())
    } catch (error) {
      expect(error.message).toBe("the 'folderName' must conform to the npm package name specification: 一个亿的项目")
    }
  })

  test('When the target directory already exists, will throw a error', async () => {
    expect.assertions(3)
    try {
      // call pathExistsSync twice
      // the first time to check baseDirectory
      // the second time to check targetDirectory
      pathExistsSyncSpy.mockImplementationOnce(() => true) // baseDirectory exists, not mkdir
      pathExistsSyncSpy.mockImplementationOnce(() => true) // targetDirectory exists, throw error
      await runAction(CreateAction)('my-project', undefined, {}, new Command())
    } catch (error) {
      expect(pathExistsSyncSpy).toBeCalledTimes(2)
      expect(mkdirpSyncSpy).not.toBeCalled()
      expect(error.message).toContain('already exists')
    }
  })

  test('When the base directory already exists, will create it', async () => {
    expect.assertions(3)
    try {
      // call pathExistsSync twice
      // the first time to check baseDirectory
      // the second time to check targetDirectory
      pathExistsSyncSpy.mockImplementationOnce(() => false) // baseDirectory not exist, mkdir
      pathExistsSyncSpy.mockImplementationOnce(() => false) // targetDirectory not exist, good!
      await runAction(CreateAction)('my-project', undefined, {}, new Command())
      // after passing the directory check, you will enter the baseInfo inquiry,
      // where we intentionally throw an error in the prompt
      // to interrupt the subsequent operation
    } catch (error) {
      expect(pathExistsSyncSpy).toBeCalledTimes(2)
      expect(mkdirpSyncSpy).toBeCalled()
      expect(error.message).toContain('Deliberate Mistakes')
    }
  })

  // non-interactive
  test('When the --yes options is passed, will check --name option, it is required and valid', async () => {
    expect.assertions(2)
    try {
      // call pathExistsSync twice
      // the first time to check baseDirectory
      // the second time to check targetDirectory
      pathExistsSyncSpy.mockImplementationOnce(() => false) // baseDirectory exist, not mkdir
      pathExistsSyncSpy.mockImplementationOnce(() => false) // targetDirectory not exist, good!
      await runAction(CreateAction)('my-project', undefined, { yes: true, name: '一个亿的项目' }, new Command())
    } catch (error) {
      expect(pathExistsSyncSpy).toBeCalledTimes(2)
      expect(error.message).toContain('missing option --name or not a valid npm package name')
    }
  })

  test('When the --yes options is passed, will check --version option, it is required and valid', async () => {
    expect.assertions(2)
    try {
      // call pathExistsSync twice
      // the first time to check baseDirectory
      // the second time to check targetDirectory
      pathExistsSyncSpy.mockImplementationOnce(() => false) // baseDirectory exist, not mkdir
      pathExistsSyncSpy.mockImplementationOnce(() => false) // targetDirectory not exist, good!
      await runAction(CreateAction)(
        'my-project',
        undefined,
        { yes: true, name: 'my-project', version: '1' },
        new Command(),
      )
    } catch (error) {
      expect(pathExistsSyncSpy).toBeCalledTimes(2)
      expect(error.message).toContain('missing option --version or not a valid version')
    }
  })

  test('When the --yes options is passed, will check --author option, it is required', async () => {
    expect.assertions(2)
    try {
      // call pathExistsSync twice
      // the first time to check baseDirectory
      // the second time to check targetDirectory
      pathExistsSyncSpy.mockImplementationOnce(() => false) // baseDirectory exist, not mkdir
      pathExistsSyncSpy.mockImplementationOnce(() => false) // targetDirectory not exist, good!
      await runAction(CreateAction)(
        'my-project',
        undefined,
        { yes: true, name: 'my-project', version: '1.0.0', author: undefined },
        new Command(),
      )
    } catch (error) {
      expect(pathExistsSyncSpy).toBeCalledTimes(2)
      expect(error.message).toContain('missing option --author')
    }
  })

  test('When the --yes options is passed and all option are valid, will get baseInfo', async () => {
    // call pathExistsSync twice
    // the first time to check baseDirectory
    // the second time to check targetDirectory
    pathExistsSyncSpy.mockImplementationOnce(() => false) // baseDirectory exist, not mkdir
    pathExistsSyncSpy.mockImplementationOnce(() => false) // targetDirectory not exist, good!
    const createAction = await runAction(CreateAction)(
      'my-project',
      undefined,
      { yes: true, name: 'my-project', version: '1.0.0', author: 'Cphayim' },
      new Command(),
    )
    expect(pathExistsSyncSpy).toBeCalledTimes(2)
    expect(createAction.baseInfo).toEqual({ name: 'my-project', version: '1.0.0', author: 'Cphayim' })
  })

  // interactive
  test('When user has answered the projectName, version, and author, will get baseInfo', async () => {
    // call pathExistsSync twice
    // the first time to check baseDirectory
    // the second time to check targetDirectory
    pathExistsSyncSpy.mockImplementationOnce(() => false) // baseDirectory exist, not mkdir
    pathExistsSyncSpy.mockImplementationOnce(() => false) // targetDirectory not exist, good!
    prompt.mockReturnValueOnce(Promise.resolve({ name: 'my-project', version: '1.0.0', author: 'Cphayim' }))
    const createAction = await runAction(CreateAction)('my-project', undefined, {}, new Command())
    expect(pathExistsSyncSpy).toBeCalledTimes(2)
    expect(createAction.baseInfo).toEqual({ name: 'my-project', version: '1.0.0', author: 'Cphayim' })
  })

  // getBoilerplateChoiceName
  test('Can get correct boilerplate choice name', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createAction = new CreateAction('my-project', '.', {} as any, new Command())
    const boilerplate: Boilerplate = {
      name: 'my-boilerplate',
      desc: 'description-content',
      package: '@vrn-deco/my-boilerplate',
      version: '1.0.0',
      tags: ['web', 'mobile'],
    }
    const boilerplateChoiceName = createAction.getBoilerplateChoiceName(boilerplate)
    expect(boilerplateChoiceName).toContain(boilerplate.name)
    expect(boilerplateChoiceName).toContain(boilerplate.desc)
    expect(boilerplateChoiceName).toContain(boilerplate.tags?.join(','))
  })
})
