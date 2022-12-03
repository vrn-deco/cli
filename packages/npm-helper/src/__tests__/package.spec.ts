import os from 'node:os'
import path from 'node:path'

import fs from 'fs-extra'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { logger } from '@vrn-deco/cli-log'

import { DistTag } from '../common.js'

const execaMock = vi.fn()
const isPackageMock = vi.fn()
const installPackageMock = vi.fn()
const queryPackageVersionMock = vi.fn()

const fns = [execaMock, isPackageMock, installPackageMock, queryPackageVersionMock]

vi.mock('execa', async () => {
  const execa = await vi.importActual<typeof import('execa')>('execa')
  return {
    ...execa,
    execa: execaMock,
  }
})
vi.mock('../utils.js', async () => {
  const utils = await vi.importActual<typeof import('../utils.js')>('../utils.js')
  return {
    ...utils,
    isPackage: isPackageMock,
  }
})
vi.mock('../install.js', async () => {
  const install = await vi.importActual<typeof import('../install.js')>('../install.js')
  return {
    ...install,
    installPackage: installPackageMock,
  }
})
vi.mock('../querier.js', async () => {
  const querier = await vi.importActual<typeof import('../querier.js')>('../querier.js')
  return {
    ...querier,
    queryPackageVersion: queryPackageVersionMock,
  }
})

// disabled logger
logger.setLevel('silent')

const TEST_CLI_HOME_PATH = path.resolve(os.homedir(), '.vrn-deco.test')
const TEST_PACKAGE_NAME = '@vrn-deco/test-pkg'
const TEST_PACKAGE_JSON = { name: TEST_PACKAGE_NAME, version: '1.0.0' }

const { NPMPackage } = await import('../package.js')

type NPMListResult = {
  dependencies: { [key: string]: { version: string } }
}

beforeEach(() => {
  fns.forEach((fn) => fn.mockReset())
})

describe('@vrn-deco/cli-npm-helper -> package.ts local mode', () => {
  const moduleMap = {
    [TEST_PACKAGE_NAME]: path.join(TEST_CLI_HOME_PATH, 'test-pkg'),
  }
  beforeAll(() => {
    process.env.VRN_CLI_MODULE_MAP = JSON.stringify(moduleMap)
  })
  afterAll(() => {
    process.env.VRN_CLI_MODULE_MAP = ''
    vi.restoreAllMocks()
  })

  it('Can create a NPMPackage object with local mode', async () => {
    const pkg = new NPMPackage({ name: TEST_PACKAGE_NAME })
    expect(pkg).toBeDefined()
  })

  it('ModuleMap can be successfully loaded if it is correct', async () => {
    expect.assertions(1)
    isPackageMock.mockImplementationOnce(() => true)
    const pkg = new NPMPackage({ name: TEST_PACKAGE_NAME })
    await expect(pkg.load()).resolves.toBeInstanceOf(NPMPackage)
  })

  it('Error thrown if moduleMap does not exist', async () => {
    expect.assertions(1)
    isPackageMock.mockImplementationOnce(() => false)
    const pkg = new NPMPackage({ name: TEST_PACKAGE_NAME })
    await expect(pkg.load()).rejects.toThrow('is not a package')
  })

  it('Calling a method or getting properties without Loaded will throw an error', async () => {
    expect.assertions(1)
    isPackageMock.mockImplementationOnce(() => true)
    const pkg = new NPMPackage({ name: TEST_PACKAGE_NAME })
    expect(() => pkg.packageDir).toThrow('please call and await the `load` is complete')
  })

  it('Load succeeds, can get the packageDir, packageJSON, mainScript', async () => {
    isPackageMock.mockImplementationOnce(() => true)
    const pkg = new NPMPackage({ name: TEST_PACKAGE_NAME })
    await expect(pkg.load()).resolves.toBeInstanceOf(NPMPackage)
    expect(pkg.packageDir).toBe(moduleMap[TEST_PACKAGE_NAME])

    vi.spyOn(fs, 'readJsonSync').mockImplementationOnce(() => TEST_PACKAGE_JSON)
    expect(pkg.packageJSON).toEqual(TEST_PACKAGE_JSON)

    // No mainScript field
    vi.spyOn(fs, 'readJsonSync').mockImplementationOnce(() => TEST_PACKAGE_JSON)
    expect(() => pkg.mainScript).toThrow('not exists')

    vi.spyOn(fs, 'readJsonSync').mockImplementationOnce(() => ({ ...TEST_PACKAGE_JSON, main: 'index.js' }))
    expect(pkg.mainScript).toBe(path.join(moduleMap[TEST_PACKAGE_NAME], 'index.js'))
  })
})

describe('@vrn-deco/cli-npm-helper -> package.ts default mode', () => {
  it('Can create a NPMPackage object with default mode', async () => {
    const pkg = new NPMPackage({ name: TEST_PACKAGE_NAME, versionOrDistTag: '1.0.0', baseDir: TEST_CLI_HOME_PATH })
    expect(pkg).toBeDefined()
  })

  it('Calling a method or getting properties without Loaded will throw an error', async () => {
    isPackageMock.mockImplementationOnce(() => true)
    const pkg = new NPMPackage({ name: TEST_PACKAGE_NAME, versionOrDistTag: '1.0.0', baseDir: TEST_CLI_HOME_PATH })
    expect(() => pkg.packageDir).toThrow('please call and await the `load` is complete')
  })

  it('If the dist-tag passed in does not find the corresponding version, an error will be thrown', async () => {
    const pkg = new NPMPackage({ name: TEST_PACKAGE_NAME, versionOrDistTag: DistTag.Next, baseDir: TEST_CLI_HOME_PATH })
    queryPackageVersionMock.mockImplementationOnce(() => Promise.resolve(undefined))
    await expect(pkg.load()).rejects.toThrow('not found at')
    expect(queryPackageVersionMock.mock.calls[0][0]).toBe(TEST_PACKAGE_NAME)
    expect(queryPackageVersionMock.mock.calls[0][1]).toBe(DistTag.Next)
  })

  it('If the incoming version has already been installed, it will not be installed again', async () => {
    const pkg = new NPMPackage({
      name: TEST_PACKAGE_NAME,
      versionOrDistTag: DistTag.Next,
      baseDir: TEST_CLI_HOME_PATH,
    })
    queryPackageVersionMock.mockImplementationOnce(() => Promise.resolve('1.0.0'))
    const npmListResult: NPMListResult = {
      dependencies: {
        [TEST_PACKAGE_NAME]: { version: '1.0.0' },
      },
    }
    execaMock.mockImplementationOnce(() => Promise.resolve({ stdout: JSON.stringify(npmListResult) }))
    await expect(pkg.load()).resolves.toBeInstanceOf(NPMPackage)
    expect(queryPackageVersionMock.mock.calls[0][0]).toBe(TEST_PACKAGE_NAME)
    expect(queryPackageVersionMock.mock.calls[0][1]).toBe(DistTag.Next)
    // installed, no need to install
    expect(installPackageMock).not.toBeCalled()
  })

  it('If the incoming version is not installed, the installation will take place', async () => {
    const pkg = new NPMPackage({
      name: TEST_PACKAGE_NAME,
      versionOrDistTag: DistTag.Next,
      baseDir: TEST_CLI_HOME_PATH,
    })
    queryPackageVersionMock.mockImplementationOnce(() => Promise.resolve('1.0.0'))
    const npmListResult: NPMListResult = {
      dependencies: {},
    }
    execaMock.mockImplementationOnce(() => Promise.resolve({ stdout: JSON.stringify(npmListResult) }))
    await expect(pkg.load()).resolves.toBeInstanceOf(NPMPackage)
    expect(installPackageMock).toBeCalled()
  })

  it('Load succeeds, can get the packageDir, packageJSON, mainScript', async () => {
    const pkg = new NPMPackage({
      name: TEST_PACKAGE_NAME,
      versionOrDistTag: '1.0.0',
      baseDir: TEST_CLI_HOME_PATH,
    })
    const npmListResult: NPMListResult = {
      dependencies: {
        [TEST_PACKAGE_NAME]: { version: '1.0.0' },
      },
    }
    execaMock.mockImplementationOnce(() => Promise.resolve({ stdout: JSON.stringify(npmListResult) }))
    await expect(pkg.load()).resolves.toBeInstanceOf(NPMPackage)
    expect(pkg.packageDir).toBe(path.join(TEST_CLI_HOME_PATH, 'node_modules', TEST_PACKAGE_NAME))

    vi.spyOn(fs, 'readJsonSync').mockImplementationOnce(() => TEST_PACKAGE_JSON)
    expect(pkg.packageJSON).toEqual(TEST_PACKAGE_JSON)

    // No mainScript field
    vi.spyOn(fs, 'readJsonSync').mockImplementationOnce(() => TEST_PACKAGE_JSON)
    expect(() => pkg.mainScript).toThrow('not exists')

    vi.spyOn(fs, 'readJsonSync').mockImplementationOnce(() => ({ ...TEST_PACKAGE_JSON, main: 'index.js' }))
    expect(pkg.mainScript).toBe(path.join(TEST_CLI_HOME_PATH, 'node_modules', TEST_PACKAGE_NAME, 'index.js'))
  })
})
