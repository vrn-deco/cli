import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { jest } from '@jest/globals'
import { NPMRegistry, PackageManager, testShared } from '@vrn-deco/cli-shared'
import { NPMPackage } from '@vrn-deco/cli-npm-helper'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const MOCK_MANIFEST_MAIN_SCRIPT = path.join(__dirname, '..', '__mocks__', 'mock-manifest.cjs')

// mock readConfig
const readConfig = jest.fn(() => ({ npmRegistry: NPMRegistry.NPM, packageManager: PackageManager.NPM }))

const cliConfigHelper = await import('@vrn-deco/cli-config-helper')
jest.unstable_mockModule('@vrn-deco/cli-config-helper', () => ({
  ...cliConfigHelper,
  readConfig,
}))

// mock NPMPackage
const NPMPackageLoadSpy = jest
  .spyOn(NPMPackage.prototype, 'load')
  .mockImplementation(async function (this: NPMPackage) {
    return this
  })
const getMainScriptSpy = jest
  .spyOn(NPMPackage.prototype, 'mainScript', 'get')
  .mockReturnValue(MOCK_MANIFEST_MAIN_SCRIPT)

const { PackageBoilerplateService } = await import('../../services/boilerplate.service.js')

beforeAll(() => {
  testShared.injectTestEnv()
})

beforeEach(() => {
  readConfig.mockClear()
  NPMPackageLoadSpy.mockClear()
  getMainScriptSpy.mockClear()
})

afterAll(() => {
  readConfig.mockRestore()
  NPMPackageLoadSpy.mockRestore()
  getMainScriptSpy.mockRestore()
})

describe('@vrn-deco/cli-command-boilerplate -> services -> boilerplate.service.ts -> PackageBoilerplateService', () => {
  test('Can correct load and cache manifest', async () => {
    const service = new PackageBoilerplateService()
    expect(readConfig).toBeCalled()
    const manifest = await service.loadManifest()
    expect(NPMPackageLoadSpy).toBeCalled()
    expect(getMainScriptSpy).toBeCalled()
    expect(manifest).toBeTruthy()
    const { getManifest } = await import(MOCK_MANIFEST_MAIN_SCRIPT)
    expect(manifest).toEqual(getManifest())

    const manifest2 = await service.loadManifest()
    expect(manifest2).toBe(manifest) // ===
  })

  test('Can correct load boilerplate', async () => {
    const service = new PackageBoilerplateService()
    const boiPackage = await service.loadBoilerplate('@vrn-deco/boilerplate-typescript-xxx')
    expect(boiPackage).toBeTruthy()
    expect(boiPackage).toBeInstanceOf(NPMPackage)
  })
})
