import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import { jest } from '@jest/globals'

import { logger } from '@vrn-deco/cli-log'
import { NPMRegistry, PackageManager, testShared } from '@vrn-deco/cli-shared'
import { NPMPackage } from '@vrn-deco/cli-npm-helper'
import { DEFAULT_API_BASE_URL } from '../../common.js'

logger.setLevel('silent')

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

// mock node-fetch
const json = jest.fn(() => ({}))
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fetch = jest.fn((_url: string) => Promise.resolve({ json, ok: true, body: {}, statusText: 'ok' }))
jest.unstable_mockModule('node-fetch', () => ({ default: fetch }))

// mock fs.createWriteStream and pipeline
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore-next-line
const createWriteStreamSpy = jest.spyOn(fs, 'createWriteStream').mockImplementation(() => void 0)
const pipeline = jest.fn<void, [string, string, () => void]>().mockImplementation((_a, _b, c) => c())
jest.unstable_mockModule('node:stream', () => ({
  pipeline,
}))

const { PackageBoilerplateService, HTTPBoilerplateService } = await import('../../services/boilerplate.service.js')

beforeAll(() => {
  testShared.injectTestEnv()
})

describe('@vrn-deco/cli-command-boilerplate -> services -> boilerplate.service.ts -> PackageBoilerplateService', () => {
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

describe('@vrn-deco/cli-command-boilerplate -> services -> boilerplate.service.ts -> HTTPBoilerplateService', () => {
  beforeEach(() => {
    json.mockClear()
    fetch.mockClear()
    createWriteStreamSpy.mockClear()
    pipeline.mockClear()
  })
  afterAll(() => {
    json.mockRestore()
    fetch.mockRestore()
    createWriteStreamSpy.mockRestore()
    pipeline.mockRestore()
  })
  test('Can correct fetch and cache manifest', async () => {
    const { getAPIManifest } = await import(MOCK_MANIFEST_MAIN_SCRIPT)
    json.mockReturnValueOnce(getAPIManifest())
    const service = new HTTPBoilerplateService()
    const manifest = await service.loadManifest()
    expect(fetch).toBeCalled()
    expect(json).toBeCalled()
    expect(manifest).toBeTruthy()
    expect(manifest).toEqual(getAPIManifest())

    const manifest2 = await service.loadManifest()
    expect(manifest2).toBe(manifest) // ===
  })

  test('When fetch manifest failed, will throw a error', async () => {
    expect.assertions(3)
    try {
      fetch.mockRejectedValueOnce(new Error('BOOM'))
      const service = new HTTPBoilerplateService()
      await service.loadManifest()
    } catch (error) {
      expect(fetch).toBeCalled()
      expect(json).not.toBeCalled()
      expect(error.message).toContain('Failed to fetch boilerplate manifest')
    }
  })

  test('Can correct download packed boilerplate', async () => {
    const service = new HTTPBoilerplateService()
    const file = await service.downloadBoilerplate('typescript-xxx.tgz', '/home')
    expect(file).toBe('typescript-xxx.tgz')
    expect(fetch).toBeCalled()
    expect(fetch.mock.calls[0][0]).toBe(`${DEFAULT_API_BASE_URL}/typescript-xxx.tgz`)
    expect(createWriteStreamSpy).toBeCalled()
    expect(pipeline).toBeCalled()

    const file2 = await service.downloadBoilerplate('https://aaa.bb.com/typescript-xxx.tgz', '/home')
    expect(file2).toBe('typescript-xxx.tgz')
    expect(fetch.mock.calls[1][0]).toBe('https://aaa.bb.com/typescript-xxx.tgz')
  })

  test('When fetch boilerplate failed, will throw a error', async () => {
    expect.assertions(2)
    try {
      fetch.mockResolvedValueOnce({ json, ok: false, body: {}, statusText: 'Not found' })
      const service = new HTTPBoilerplateService()
      await service.downloadBoilerplate('typescript-xxx.tgz', '/home')
    } catch (error) {
      expect(fetch).toBeCalled()
      expect(error.message).toContain(`Failed to download boilerplate`)
    }
  })
})