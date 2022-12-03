import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { logger } from '@vrn-deco/cli-log'

logger.setLevel('silent')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MOCK_CREATE_ACTION_SCRIPT = path.join(__dirname, '..', '__mocks__', 'mock-create.action.mjs')
const MOCK_MANIFEST_MAIN_SCRIPT = path.join(__dirname, '..', '__mocks__', 'mock-manifest.cjs')
const MOCK_BOI_PACKAGE_RUNNER_SCRIPT = path.join(__dirname, '..', '__mocks__', 'mock-boi-package-runner.cjs')
const MOCK_PACKAGE_MANIFEST = (await import(MOCK_MANIFEST_MAIN_SCRIPT)).getManifest()

// mock parent class CreateAction
vi.mock('../../create/create.action.js', async () => {
  const { CreateActionMock } = await vi.importActual(MOCK_CREATE_ACTION_SCRIPT)
  return {
    CreateAction: CreateActionMock,
  }
})

// mock loadManifest
const loadPackageManifest = vi.fn(async () => MOCK_PACKAGE_MANIFEST)
const loadPackageBoilerplate = vi.fn(() => ({
  mainScript: MOCK_BOI_PACKAGE_RUNNER_SCRIPT, // mock runner
}))
const PackageBoilerplateService = vi.fn(function () {
  return { loadManifest: loadPackageManifest, loadBoilerplate: loadPackageBoilerplate }
})
vi.mock('../../services/boilerplate.service.js', async () => {
  const boilerplateServiceModule = await vi.importActual<typeof import('../../services/boilerplate.service.js')>(
    '../../services/boilerplate.service.js',
  )
  return {
    ...boilerplateServiceModule,
    // mock class
    PackageBoilerplateService,
  }
})

// mock runner
const runner = vi.fn().mockImplementation(() => Promise.resolve())
const runnerModule = {
  default: runner,
}
const dynamicImport = vi.fn().mockImplementation(() => Promise.resolve(runnerModule))
vi.mock('@vrn-deco/cli-shared', async () => {
  const sharedModule = await vi.importActual<typeof import('@vrn-deco/cli-shared')>('@vrn-deco/cli-shared')
  return { ...sharedModule, dynamicImport }
})

// mock prompt
const prompt = vi.fn().mockRejectedValue(new Error('Deliberate Mistakes'))
vi.mock('@vrn-deco/cli-command', async () => {
  const cliCommandModule = await vi.importActual<typeof import('@vrn-deco/cli-command')>('@vrn-deco/cli-command')
  return {
    ...cliCommandModule,
    prompt,
  }
})

const { testShared } = await import('@vrn-deco/cli-shared')
const { Command, runAction } = await import('@vrn-deco/cli-command')
const { PackageCreateAction } = await import('../../create/package-create.action.js')

beforeAll(() => {
  testShared.injectTestEnv()
})
beforeEach(() => {
  loadPackageManifest.mockClear()
  loadPackageBoilerplate.mockClear()
  dynamicImport.mockClear()
  runner.mockClear()
})
afterAll(() => {
  loadPackageManifest.mockRestore()
  loadPackageBoilerplate.mockRestore()
  dynamicImport.mockRestore()
  runner.mockRestore()
})

// here we only test of PackageCreateAction, the parent CreateAction is the mock
// the test case for CreateAction at . /create.action.spec.ts
describe('@vrn-deco/cli-command-boilerplate -> create -> package-create.action.ts', () => {
  // non-interactive
  it('When the --yes options is passed, will check --target-boilerplate option, it is required', async () => {
    expect.assertions(1)
    try {
      await runAction(PackageCreateAction)('my-project', undefined, { yes: true }, new Command())
    } catch (error) {
      expect(error.message).toContain('missing option --target-boilerplate')
    }
  })

  it('When the --yes options is passed and all option are valid, will exec creation', async () => {
    await runAction(PackageCreateAction)(
      'my-project',
      undefined,
      { yes: true, targetBoilerplate: '@vrn-deco/boilerplate-typescript-xxx' },
      new Command(),
    )
    // non-interactive, so not call loadManifest
    expect(loadPackageManifest).not.toBeCalled()
    expect(loadPackageBoilerplate).toBeCalled()
    expect(dynamicImport).toBeCalled()
    expect(dynamicImport).toBeCalledWith(MOCK_BOI_PACKAGE_RUNNER_SCRIPT)
    expect(runner).toBeCalled()
  })

  // interactive
  it('When user has selected the boilerplate by manifest, will exec creation', async () => {
    prompt.mockReturnValueOnce(
      Promise.resolve({ boilerplate: { package: '@vrn-deco/boilerplate-typescript-xxx', version: '1.0.0' } }),
    )
    await runAction(PackageCreateAction)('my-project', undefined, {}, new Command())
    expect(loadPackageManifest).toBeCalled()
    expect(loadPackageBoilerplate).toBeCalled()
    expect(dynamicImport).toBeCalled()
    expect(dynamicImport).toBeCalledWith(MOCK_BOI_PACKAGE_RUNNER_SCRIPT)
    expect(runner).toBeCalled()
  })

  it('When manifest is a empty array, will throw a error', async () => {
    expect.assertions(2)
    try {
      loadPackageManifest.mockReturnValueOnce(Promise.resolve([]))
      await runAction(PackageCreateAction)('my-project', undefined, {}, new Command())
    } catch (error) {
      expect(loadPackageManifest).toBeCalled()
      expect(error.message).toContain('boilerplate manifest is empty')
    }
  })

  it('When runner exec failed, will throw a error', async () => {
    expect.assertions(6)
    try {
      prompt.mockReturnValueOnce(
        Promise.resolve({ boilerplate: { package: '@vrn-deco/boilerplate-typescript-xxx', version: '1.0.0' } }),
      )
      runner.mockRejectedValueOnce(new Error('Deliberate Mistakes'))
      await runAction(PackageCreateAction)('my-project', undefined, {}, new Command())
    } catch (error) {
      expect(loadPackageManifest).toBeCalled()
      expect(loadPackageBoilerplate).toBeCalled()
      expect(dynamicImport).toBeCalled()
      expect(dynamicImport).toBeCalledWith(MOCK_BOI_PACKAGE_RUNNER_SCRIPT)
      expect(runner).toBeCalled()
      expect(error.message).toContain('Boilerplate runner execution failed')
    }
  })
})
