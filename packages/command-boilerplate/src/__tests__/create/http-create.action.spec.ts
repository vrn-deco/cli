import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import { jest } from '@jest/globals'

import { Command, runAction } from '@vrn-deco/cli-command'
import { logger } from '@vrn-deco/cli-log'
import { testShared } from '@vrn-deco/cli-shared'

logger.setLevel('silent')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MOCK_CREATE_ACTION_SCRIPT = path.join(__dirname, '..', '__mocks__', 'mock-create.action.mjs')
const MOCK_MANIFEST_MAIN_SCRIPT = path.join(__dirname, '..', '__mocks__', 'mock-manifest.cjs')
const MOCK_API_MANIFEST = (await import(MOCK_MANIFEST_MAIN_SCRIPT)).getAPIManifest()

// mock parent class CreateAction

const { CreateActionMock } = await import(MOCK_CREATE_ACTION_SCRIPT)
jest.unstable_mockModule('../../create/create.action.js', () => ({
  CreateAction: CreateActionMock,
}))

// mock loadManifest
const boilerplateServiceModule = await import('../../services/boilerplate.service.js')
const loadAPIManifest = jest.fn(async () => MOCK_API_MANIFEST)
const downloadBoilerplate = jest.fn((file: string) => path.basename(file))
const HTTPBoilerplateService = jest.fn(function () {
  return { loadManifest: loadAPIManifest, downloadBoilerplate }
})
jest.unstable_mockModule('../../services/boilerplate.service.js', () => ({
  ...boilerplateServiceModule,
  // mock class
  HTTPBoilerplateService,
}))

// mock prompt
const prompt = jest.fn().mockRejectedValue(new Error('Deliberate Mistakes'))
const cliCommandModule = await import('@vrn-deco/cli-command')
jest.unstable_mockModule('@vrn-deco/cli-command', () => ({
  ...cliCommandModule,
  prompt,
}))

// mock compressing
const uncompress = jest.fn(() => void 0)
jest.unstable_mockModule('compressing', () => ({
  default: {
    tgz: { uncompress },
    tar: { uncompress },
    zip: { uncompress },
  },
}))

// mock fs-extra
jest.spyOn(fs, 'moveSync').mockImplementation(() => void 0)
jest.spyOn(fs, 'removeSync').mockImplementation(() => void 0)

const warnSpy = jest.spyOn(logger, 'warn')

const { HTTPCreateAction } = await import('../../create/http-create.action.js')

beforeAll(() => {
  testShared.injectTestEnv()
})
beforeEach(() => {
  loadAPIManifest.mockClear()
  downloadBoilerplate.mockClear()
  uncompress.mockClear()
  warnSpy.mockClear()
})
afterAll(() => {
  loadAPIManifest.mockRestore()
  downloadBoilerplate.mockRestore()
  uncompress.mockRestore()
  warnSpy.mockRestore()
})

// here we only test of PackageCreateAction, the parent CreateAction is the mock
// the test case for CreateAction at . /create.action.spec.ts
describe('@vrn-deco/cli-command-boilerplate -> create -> package-create.action.ts', () => {
  // non-interactive
  test('When the --yes options is passed, will check --target-boilerplate option, it is required', async () => {
    expect.assertions(1)
    try {
      await runAction(HTTPCreateAction)('my-project', undefined, { yes: true }, new Command())
    } catch (error) {
      expect(error.message).toContain('missing option --target-boilerplate')
    }
  })

  test('When the --yes options is passed and all option are valid, will exec creation', async () => {
    await runAction(HTTPCreateAction)(
      'my-project',
      undefined,
      { yes: true, targetBoilerplate: 'mock-boilerplate.tgz' },
      new Command(),
    )
    // non-interactive, so not call loadManifest
    expect(loadAPIManifest).not.toBeCalled()
    expect(downloadBoilerplate).toBeCalled()
    expect(downloadBoilerplate.mock.calls[0][0]).toBe('mock-boilerplate.tgz')
  })

  // interactive
  test('When user has selected the boilerplate by manifest, will download packed', async () => {
    prompt.mockReturnValueOnce(Promise.resolve({ boilerplate: { file: 'mock-boilerplate.tgz' } }))
    await runAction(HTTPCreateAction)('my-project', undefined, {}, new Command())
    expect(loadAPIManifest).toBeCalled()
    expect(downloadBoilerplate).toBeCalled()
    expect(downloadBoilerplate.mock.calls[0][0]).toBe('mock-boilerplate.tgz')
  })

  test('When manifest is a empty array, will throw a error', async () => {
    expect.assertions(2)
    try {
      loadAPIManifest.mockReturnValueOnce(Promise.resolve([]))
      await runAction(HTTPCreateAction)('my-project', undefined, {}, new Command())
    } catch (error) {
      expect(loadAPIManifest).toBeCalled()
      expect(error.message).toContain('boilerplate manifest is empty')
    }
  })

  test('When user has selected the boilerplate by manifest, will download packed', async () => {
    prompt.mockReturnValueOnce(Promise.resolve({ boilerplate: { file: 'mock-boilerplate.tgz' } }))
    await runAction(HTTPCreateAction)('my-project', undefined, {}, new Command())
    expect(loadAPIManifest).toBeCalled()
    expect(downloadBoilerplate).toBeCalled()
    expect(downloadBoilerplate.mock.calls[0][0]).toBe('mock-boilerplate.tgz')
  })

  test('Can unpack supported file extension: .tgz`, `.tar` and `.zip`', async () => {
    await runAction(HTTPCreateAction)(
      'my-project',
      undefined,
      { yes: true, targetBoilerplate: 'mock-boilerplate.tgz' },
      new Command(),
    )
    await runAction(HTTPCreateAction)(
      'my-project',
      undefined,
      { yes: true, targetBoilerplate: 'mock-boilerplate.tar' },
      new Command(),
    )
    await runAction(HTTPCreateAction)(
      'my-project',
      undefined,
      { yes: true, targetBoilerplate: 'mock-boilerplate.zip' },
      new Command(),
    )
    expect(uncompress).toBeCalledTimes(3)
    expect(warnSpy).not.toBeCalled()
  })

  test('When unpack unsupported file extension, will print warnning', async () => {
    await runAction(HTTPCreateAction)(
      'my-project',
      undefined,
      { yes: true, targetBoilerplate: 'mock-boilerplate.rar' },
      new Command(),
    )
    expect(warnSpy).toBeCalledTimes(2)
    expect(warnSpy.mock.calls[0][0]).toContain('Unable to unpack boilerplate: unsupported file extension: .rar')
    expect(warnSpy.mock.calls[1][0]).toContain('Please try to unpack it yourself')
  })
})
