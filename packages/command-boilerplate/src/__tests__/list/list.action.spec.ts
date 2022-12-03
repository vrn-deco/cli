import path from 'node:path'
import { fileURLToPath } from 'node:url'

import fs from 'fs-extra'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import YAML from 'yaml'

import { Command, runAction } from '@vrn-deco/cli-command'
import { testShared } from '@vrn-deco/cli-shared'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MOCK_MANIFEST_MAIN_SCRIPT = path.join(__dirname, '..', '__mocks__', 'mock-manifest.cjs')
const MOCK_PACKAGE_MANIFEST = (await import(MOCK_MANIFEST_MAIN_SCRIPT)).getManifest()

// mock loadManifest
const loadPackageManifest = vi.fn(async () => MOCK_PACKAGE_MANIFEST)
vi.mock('../../services/boilerplate.service.js', async () => {
  const boilerplateServiceModule = await vi.importActual<typeof import('../../services/boilerplate.service.js')>(
    '../../services/boilerplate.service.js',
  )
  return {
    ...boilerplateServiceModule,
    // mock class
    PackageBoilerplateService: function () {
      return {
        loadManifest: loadPackageManifest,
      }
    },
  }
})

// mock process.stdout.write
const stdoutWriteSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

// mock fs.mkdirpSync and fs.writeFileSync
const fsMkdirpSyncSpy = vi.spyOn(fs, 'mkdirpSync').mockImplementation(() => void 0)
const fsWriteFileSyncSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => void 0)

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
  it('Can print simple manifest', async () => {
    await runAction(ListAction)({}, new Command())
    expect(loadPackageManifest).toBeCalled()
    expect(stdoutWriteSpy).toBeCalled()
    const outputContent = stdoutWriteSpy.mock.calls[0][0]
    expect(outputContent).toBeDefined()
    expect(fsMkdirpSyncSpy).not.toBeCalled()
    expect(fsWriteFileSyncSpy).not.toBeCalled()
  })

  it('Can print simple manifest and write file', async () => {
    await runAction(ListAction)({ outFile: OUTFILE }, new Command())
    expect(loadPackageManifest).toBeCalled()
    expect(stdoutWriteSpy).toBeCalled()
    const outputContent = stdoutWriteSpy.mock.calls[0][0]
    expect(outputContent).toBeDefined()
    expect(fsMkdirpSyncSpy).toBeCalled()
    expect(fsWriteFileSyncSpy).toBeCalled()
    expect(fsWriteFileSyncSpy.mock.calls[0][0]).toContain(OUTFILE)
  })

  it('Can print json manifest', async () => {
    await runAction(ListAction)({ json: true }, new Command())
    expect(loadPackageManifest).toBeCalled()
    expect(stdoutWriteSpy).toBeCalled()
    const outputContent = stdoutWriteSpy.mock.calls[0][0]
    expect(JSON.parse(outputContent as string)).toEqual(MOCK_PACKAGE_MANIFEST)
    expect(fsMkdirpSyncSpy).not.toBeCalled()
    expect(fsWriteFileSyncSpy).not.toBeCalled()
  })

  it('Can print json manifest and write file', async () => {
    await runAction(ListAction)({ json: true, outFile: OUTFILE }, new Command())
    expect(loadPackageManifest).toBeCalled()
    expect(stdoutWriteSpy).toBeCalled()
    const outputContent = stdoutWriteSpy.mock.calls[0][0]
    expect(JSON.parse(outputContent as string)).toEqual(MOCK_PACKAGE_MANIFEST)
    expect(fsMkdirpSyncSpy).toBeCalled()
    expect(fsWriteFileSyncSpy).toBeCalled()
    expect(fsWriteFileSyncSpy.mock.calls[0][0]).toContain(OUTFILE)
  })

  it('Can print yaml manifest', async () => {
    await runAction(ListAction)({ yaml: true }, new Command())
    expect(loadPackageManifest).toBeCalled()
    expect(stdoutWriteSpy).toBeCalled()
    const outputContent = stdoutWriteSpy.mock.calls[0][0]
    expect(YAML.parse(outputContent as string)).toEqual(MOCK_PACKAGE_MANIFEST)
    expect(fsMkdirpSyncSpy).not.toBeCalled()
    expect(fsWriteFileSyncSpy).not.toBeCalled()
  })

  it('Can print yaml manifest and write file', async () => {
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
