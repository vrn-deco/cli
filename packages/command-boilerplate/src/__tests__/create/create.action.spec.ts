import fs from 'fs-extra'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Boilerplate, Lang } from '@vrn-deco/boilerplate-protocol'
import { logger } from '@vrn-deco/cli-log'
import { testShared } from '@vrn-deco/cli-shared'

logger.setLevel('silent')

const prompt = vi.fn().mockRejectedValue(new Error('Deliberate Mistakes'))
vi.mock('@vrn-deco/cli-command', async () => {
  const cliCommandModule = await vi.importActual<typeof import('@vrn-deco/cli-command')>('@vrn-deco/cli-command')
  return {
    ...cliCommandModule,
    prompt,
  }
})

const mkdirpSyncSpy = vi.spyOn(fs, 'mkdirpSync').mockImplementation(() => void 0)
const pathExistsSyncSpy = vi.spyOn(fs, 'pathExistsSync').mockImplementation(() => true)

const { Command, runAction } = await import('@vrn-deco/cli-command')
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
  it('When folderName is invalid, will throw a error', async () => {
    expect.assertions(1)
    try {
      await runAction(CreateAction)('一个亿的项目', undefined, {}, new Command())
    } catch (error) {
      expect(error.message).toBe("the 'folderName' must conform to the npm package name specification: 一个亿的项目")
    }
  })

  it('When the target directory already exists, will throw a error', async () => {
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

  it('When the base directory already exists, will create it', async () => {
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
  it('When the --yes options is passed, will check --name option, it is required and valid', async () => {
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

  it('When the --yes options is passed, will check --version option, it is required and valid', async () => {
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

  it('When the --yes options is passed, will check --author option, it is required', async () => {
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

  it('When the --yes options is passed and all option are valid, will get baseInfo', async () => {
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

  // v1.2.2
  // Calls without arguments do not support non-interactive
  it('When the --yes options is passed and called without arguments, will throw a error', async () => {
    expect.assertions(1)
    try {
      await runAction(CreateAction)(
        undefined,
        undefined,
        { yes: true, name: 'my-project', version: '1.0.0', author: 'Cphayim' },
        new Command(),
      )
    } catch (error) {
      expect(error.message).toBe('missing arguments: folderName')
    }
  })

  // interactive
  it('When user has answered the projectName, version, and author, will get baseInfo', async () => {
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

  // v1.2.2
  // Calling with no arguments will ask the user for the folder name
  it('Calling with no arguments will ask the user for the folder name', async () => {
    // call pathExistsSync twice
    // the first time to check baseDirectory
    // the second time to check targetDirectory
    prompt.mockReturnValueOnce(Promise.resolve({ folderName: 'my-project' }))
    pathExistsSyncSpy.mockImplementationOnce(() => false) // baseDirectory exist, not mkdir
    pathExistsSyncSpy.mockImplementationOnce(() => false) // targetDirectory not exist, good!
    prompt.mockReturnValueOnce(Promise.resolve({ name: 'my-project', version: '1.0.0', author: 'Cphayim' }))
    const createAction = await runAction(CreateAction)(undefined, undefined, {}, new Command())
    expect(createAction.folderName).toBe('my-project')
    expect(pathExistsSyncSpy).toBeCalledTimes(2)
    expect(createAction.baseInfo).toEqual({ name: 'my-project', version: '1.0.0', author: 'Cphayim' })
  })

  // getBoilerplateChoiceName
  it('Can get correct boilerplate choice name', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createAction = new CreateAction('my-project', '.', {} as any, new Command())
    const boilerplate: Boilerplate = {
      name: 'my-boilerplate',
      desc: 'description-content',
      package: '@vrn-deco/my-boilerplate',
      version: '1.0.0',
      tags: ['web', 'mobile'],
      recommended: true,
      deprecated: false,
    }
    const boilerplateChoiceName = createAction.getBoilerplateChoiceName(boilerplate)
    expect(boilerplateChoiceName).toContain(boilerplate.name)
    expect(boilerplateChoiceName).toContain(boilerplate.tags?.join(', '))
    expect(boilerplateChoiceName).toContain('<recommended>')

    boilerplate.recommended = false
    boilerplate.deprecated = true
    expect(createAction.getBoilerplateChoiceName(boilerplate)).toContain('<deprecated>')
  })

  // getLangChoiceName
  it('Can get correct lang choice name', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createAction = new CreateAction('my-project', '.', {} as any, new Command())
    const lang: Lang = {
      name: 'TypeScript',
      boilerplate: [],
      recommended: true,
      deprecated: false,
    }
    const langChoiceName = createAction.getLanguageChoiceName(lang)
    expect(langChoiceName).toContain(lang.name)
    expect(langChoiceName).toContain('<recommended>')

    lang.recommended = false
    lang.deprecated = true
    expect(createAction.getLanguageChoiceName(lang)).toContain('<deprecated>')
  })
})
