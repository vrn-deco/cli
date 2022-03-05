import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import { jest } from '@jest/globals'
import { Boilerplate } from '@vrn-deco/boilerplate-protocol'

import { Command, runAction } from '@vrn-deco/cli-command'
import { logger } from '@vrn-deco/cli-log'
import { testShared } from '@vrn-deco/cli-shared'

logger.setLevel('silent')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MOCK_CREATE_ACTION_SCRIPT = path.join(__dirname, '..', '__mocks__', 'mock-create.action.mjs')
const MOCK_MANIFEST_MAIN_SCRIPT = path.join(__dirname, '..', '__mocks__', 'mock-manifest.cjs')
const MOCK_BOI_PACKAGE_RUNNER_SCRIPT = path.join(__dirname, '..', '__mocks__', 'mock-boi-package-runner.cjs')
const MOCK_PACKAGE_MANIFEST = (await import(MOCK_MANIFEST_MAIN_SCRIPT)).getManifest()

// mock parent class CreateAction

const { CreateActionMock } = await import(MOCK_CREATE_ACTION_SCRIPT)
jest.unstable_mockModule('../../create/create.action.js', () => ({
  CreateAction: CreateActionMock,
}))

// mock loadManifest
const boilerplateServiceModule = await import('../../services/boilerplate.service.js')
const loadPackageManifest = jest.fn(async () => MOCK_PACKAGE_MANIFEST)
const loadPackageBoilerplate = jest.fn(() => ({
  mainScript: MOCK_BOI_PACKAGE_RUNNER_SCRIPT, // mock runner
}))
const PackageBoilerplateService = jest.fn(function () {
  return { loadManifest: loadPackageManifest, loadBoilerplate: loadPackageBoilerplate }
})
jest.unstable_mockModule('../../services/boilerplate.service.js', () => ({
  ...boilerplateServiceModule,
  // mock class
  PackageBoilerplateService,
}))

// mock prompt
const prompt = jest.fn().mockRejectedValue(new Error('Deliberate Mistakes'))
const cliCommandModule = await import('@vrn-deco/cli-command')
jest.unstable_mockModule('@vrn-deco/cli-command', () => ({
  ...cliCommandModule,
  prompt,
}))

const { PackageCreateAction } = await import('../../create/package-create.action.js')

beforeAll(() => {
  testShared.injectTestEnv()
})
beforeEach(() => {
  loadPackageManifest.mockClear()
  loadPackageBoilerplate.mockClear()
})
afterAll(() => {
  loadPackageManifest.mockRestore()
  loadPackageBoilerplate.mockRestore()
})

// here we only test of PackageCreateAction, the parent CreateAction is the mock
// the test case for CreateAction at . /create.action.spec.ts
describe('@vrn-deco/cli-command-boilerplate -> create -> create.action.ts', () => {
  // non-interactive
  test('When the --yes options is passed, will check --target-boilerplate option, it is required', async () => {
    expect.assertions(1)
    try {
      await runAction(PackageCreateAction)('my-project', undefined, { yes: true }, new Command())
    } catch (error) {
      expect(error.message).toContain('missing option --target-boilerplate')
    }
  })

  test('When the --yes options is passed and all option are valid, will exec creation', async () => {
    await runAction(PackageCreateAction)(
      'my-project',
      undefined,
      { yes: true, targetBoilerplate: '@vrn-deco/boilerplate-typescript-xxx' },
      new Command(),
    )
    // non-interactive, so not call loadManifest
    expect(loadPackageManifest).not.toBeCalled()
    expect(loadPackageBoilerplate).toBeCalled()
  })

  // interactive
  test('When user has selected the boilerplate by manifest, will exec creation', async () => {
    prompt.mockReturnValueOnce(Promise.resolve({ boilerplate: '@vrn-deco/boilerplate-typescript-xxx' }))
    await runAction(PackageCreateAction)('my-project', undefined, {}, new Command())
    expect(loadPackageManifest).toBeCalled()
    expect(loadPackageBoilerplate).toBeCalled()
  })
})
