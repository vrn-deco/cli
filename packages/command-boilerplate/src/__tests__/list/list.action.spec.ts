import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import YAML from 'yaml'
import { jest } from '@jest/globals'

import { Command, runAction } from '@vrn-deco/cli-command'
import { testShared } from '@vrn-deco/cli-shared'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MOCK_MANIFEST_MAIN_SCRIPT = path.join(__dirname, '..', '__mocks__', 'mock-manifest.cjs')
const MOCK_PACKAGE_MANIFEST = (await import(MOCK_MANIFEST_MAIN_SCRIPT)).getManifest()

// mock loadManifest
const boilerplateServiceModule = await import('../../services/boilerplate.service.js')
const loadPackageManifest = jest.fn(async () => MOCK_PACKAGE_MANIFEST)
jest.unstable_mockModule('../../services/boilerplate.service.js', () => ({
  ...boilerplateServiceModule,
  // mock class
  PackageBoilerplateService: function () {
    return {
      loadManifest: loadPackageManifest,
    }
  },
}))

// mock process.stdout.write
const stdoutWriteSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)

// mock fs.mkdirpSync and fs.writeFileSync
const fsMkdirpSyncSpy = jest.spyOn(fs, 'mkdirpSync').mockImplementation(() => void 0)
const fsWriteFileSyncSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => void 0)

const { ListAction } = await import('../../list/list.action.js')
const OUTFILE = 'outfile.txt'

beforeAll(() => {
  testShared.injectTestEnv()
})

beforeEach(() => {
  loadPackageManifest.mockClear()
  stdoutWriteSpy.mockClear()
  fsMkdirpSyncSpy.mockClear()
  fsWriteFileSyncSpy.mockClear()
})

afterAll(() => {
  loadPackageManifest.mockRestore()
  stdoutWriteSpy.mockRestore()
  fsMkdirpSyncSpy.mockRestore()
  fsWriteFileSyncSpy.mockRestore()
})

describe('@vrn-deco/cli-command-boilerplate -> list -> list.action.ts', () => {
  test('Can print simple manifest', async () => {
    await runAction(ListAction)({}, new Command())
    expect(loadPackageManifest).toBeCalled()
    expect(stdoutWriteSpy).toBeCalled()
    const outputContent = stdoutWriteSpy.mock.calls[0][0]
    expect(outputContent).toBeDefined()
    expect(fsMkdirpSyncSpy).not.toBeCalled()
    expect(fsWriteFileSyncSpy).not.toBeCalled()
  })

  test('Can print simple manifest and write file', async () => {
    await runAction(ListAction)({ outFile: OUTFILE }, new Command())
    expect(loadPackageManifest).toBeCalled()
    expect(stdoutWriteSpy).toBeCalled()
    const outputContent = stdoutWriteSpy.mock.calls[0][0]
    expect(outputContent).toBeDefined()
    expect(fsMkdirpSyncSpy).toBeCalled()
    expect(fsWriteFileSyncSpy).toBeCalled()
    expect(fsWriteFileSyncSpy.mock.calls[0][0]).toContain(OUTFILE)
  })

  test('Can print json manifest', async () => {
    await runAction(ListAction)({ json: true }, new Command())
    expect(loadPackageManifest).toBeCalled()
    expect(stdoutWriteSpy).toBeCalled()
    const outputContent = stdoutWriteSpy.mock.calls[0][0]
    expect(JSON.parse(outputContent as string)).toEqual(MOCK_PACKAGE_MANIFEST)
    expect(fsMkdirpSyncSpy).not.toBeCalled()
    expect(fsWriteFileSyncSpy).not.toBeCalled()
  })

  test('Can print json manifest and write file', async () => {
    await runAction(ListAction)({ json: true, outFile: OUTFILE }, new Command())
    expect(loadPackageManifest).toBeCalled()
    expect(stdoutWriteSpy).toBeCalled()
    const outputContent = stdoutWriteSpy.mock.calls[0][0]
    expect(JSON.parse(outputContent as string)).toEqual(MOCK_PACKAGE_MANIFEST)
    expect(fsMkdirpSyncSpy).toBeCalled()
    expect(fsWriteFileSyncSpy).toBeCalled()
    expect(fsWriteFileSyncSpy.mock.calls[0][0]).toContain(OUTFILE)
  })

  test('Can print yaml manifest', async () => {
    await runAction(ListAction)({ yaml: true }, new Command())
    expect(loadPackageManifest).toBeCalled()
    expect(stdoutWriteSpy).toBeCalled()
    const outputContent = stdoutWriteSpy.mock.calls[0][0]
    expect(YAML.parse(outputContent as string)).toEqual(MOCK_PACKAGE_MANIFEST)
    expect(fsMkdirpSyncSpy).not.toBeCalled()
    expect(fsWriteFileSyncSpy).not.toBeCalled()
  })

  test('Can print yaml manifest and write file', async () => {
    await runAction(ListAction)({ yaml: true, outFile: OUTFILE }, new Command())
    expect(loadPackageManifest).toBeCalled()
    expect(stdoutWriteSpy).toBeCalled()
    const outputContent = stdoutWriteSpy.mock.calls[0][0]
    expect(YAML.parse(outputContent as string)).toEqual(MOCK_PACKAGE_MANIFEST)
    expect(fsMkdirpSyncSpy).toBeCalled()
    expect(fsWriteFileSyncSpy).toBeCalled()
    expect(fsWriteFileSyncSpy.mock.calls[0][0]).toContain(OUTFILE)
  })
})
