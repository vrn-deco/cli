import path from 'node:path'
import os from 'node:os'
import fs from 'fs-extra'
import { jest } from '@jest/globals'

import { logger } from '@vrn-deco/cli-log'
import { DistTag } from '../common.js'

const execaMock = jest.fn()
const isPackageMock = jest.fn()
const installPackageMock = jest.fn()
const queryPackageVersionMock = jest.fn()

const fns = [execaMock, isPackageMock, installPackageMock, queryPackageVersionMock]

const execa = await import('execa')
const utils = await import('../utils.js')
const install = await import('../install.js')
const querier = await import('../querier.js')

jest
  .unstable_mockModule('execa', () => ({
    ...execa,
    execa: execaMock,
  }))
  .unstable_mockModule('../utils.js', () => ({
    ...utils,
    isPackage: isPackageMock,
  }))
  .unstable_mockModule('../install.js', () => ({
    ...install,
    installPackage: installPackageMock,
  }))
  .unstable_mockModule('../querier.js', () => ({
    ...querier,
    queryPackageVersion: queryPackageVersionMock,
  }))

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
  })

  test('Can create a NPMPackage object with local mode', async () => {
    const pkg = new NPMPackage({ name: TEST_PACKAGE_NAME })
    expect(pkg).toBeDefined()
  })

  test('ModuleMap can be successfully loaded if it is correct', async () => {
    expect.assertions(1)
    isPackageMock.mockImplementationOnce(() => true)
    const pkg = new NPMPackage({ name: TEST_PACKAGE_NAME })
    expect(pkg.load()).resolves.not.toThrow()
  })

  test('Error thrown if moduleMap does not exist', async () => {
    expect.assertions(1)
    isPackageMock.mockImplementationOnce(() => false)
    const pkg = new NPMPackage({ name: TEST_PACKAGE_NAME })
    expect(pkg.load()).rejects.toThrow()
  })

  test('Calling a method or getting properties without Loaded will throw an error', async () => {
    expect.assertions(1)
    isPackageMock.mockImplementationOnce(() => true)
    const pkg = new NPMPackage({ name: TEST_PACKAGE_NAME })
    expect(() => pkg.packageDir).toThrow('please call and await the `load` is complete')
  })

  test('Load succeeds, can get the packageDir, packageJSON, mainScript', async () => {
    isPackageMock.mockImplementationOnce(() => true)
    const pkg = new NPMPackage({ name: TEST_PACKAGE_NAME })
    await expect(pkg.load()).resolves.not.toThrow()
    expect(pkg.packageDir).toBe(moduleMap[TEST_PACKAGE_NAME])

    jest.spyOn(fs, 'readJsonSync').mockImplementationOnce(() => TEST_PACKAGE_JSON)
    expect(pkg.packageJSON).toEqual(TEST_PACKAGE_JSON)

    // No mainScript field
    jest.spyOn(fs, 'readJsonSync').mockImplementationOnce(() => TEST_PACKAGE_JSON)
    expect(() => pkg.mainScript).toThrow('not exists')

    jest.spyOn(fs, 'readJsonSync').mockImplementationOnce(() => ({ ...TEST_PACKAGE_JSON, main: 'index.js' }))
    expect(pkg.mainScript).toBe(path.join(moduleMap[TEST_PACKAGE_NAME], 'index.js'))
  })
})

describe('@vrn-deco/cli-npm-helper -> package.ts default mode', () => {
  test('Can create a NPMPackage object with default mode', async () => {
    const pkg = new NPMPackage({ name: TEST_PACKAGE_NAME, versionOrDistTag: '1.0.0', baseDir: TEST_CLI_HOME_PATH })
    expect(pkg).toBeDefined()
  })

  test('Calling a method or getting properties without Loaded will throw an error', async () => {
    isPackageMock.mockImplementationOnce(() => true)
    const pkg = new NPMPackage({ name: TEST_PACKAGE_NAME, versionOrDistTag: '1.0.0', baseDir: TEST_CLI_HOME_PATH })
    expect(() => pkg.packageDir).toThrow('please call and await the `load` is complete')
  })

  test('If the dist-tag passed in does not find the corresponding version, an error will be thrown', async () => {
    const pkg = new NPMPackage({ name: TEST_PACKAGE_NAME, versionOrDistTag: DistTag.Next, baseDir: TEST_CLI_HOME_PATH })
    queryPackageVersionMock.mockImplementationOnce(() => Promise.resolve(undefined))
    await expect(pkg.load()).rejects.toThrow('not found at')
    expect(queryPackageVersionMock.mock.calls[0][0]).toBe(TEST_PACKAGE_NAME)
    expect(queryPackageVersionMock.mock.calls[0][1]).toBe(DistTag.Next)
  })

  test('If the incoming version has already been installed, it will not be installed again', async () => {
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
    await expect(pkg.load()).resolves.not.toThrow()
    expect(queryPackageVersionMock.mock.calls[0][0]).toBe(TEST_PACKAGE_NAME)
    expect(queryPackageVersionMock.mock.calls[0][1]).toBe(DistTag.Next)
    // installed, no need to install
    expect(installPackageMock).not.toBeCalled()
  })

  test('If the incoming version is not installed, the installation will take place', async () => {
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
    await expect(pkg.load()).resolves.not.toThrow()
    expect(installPackageMock).toBeCalled()
  })

  test('Load succeeds, can get the packageDir, packageJSON, mainScript', async () => {
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
    await expect(pkg.load()).resolves.not.toThrow()
    expect(pkg.packageDir).toBe(path.join(TEST_CLI_HOME_PATH, 'node_modules', TEST_PACKAGE_NAME))

    jest.spyOn(fs, 'readJsonSync').mockImplementationOnce(() => TEST_PACKAGE_JSON)
    expect(pkg.packageJSON).toEqual(TEST_PACKAGE_JSON)

    // No mainScript field
    jest.spyOn(fs, 'readJsonSync').mockImplementationOnce(() => TEST_PACKAGE_JSON)
    expect(() => pkg.mainScript).toThrow('not exists')

    jest.spyOn(fs, 'readJsonSync').mockImplementationOnce(() => ({ ...TEST_PACKAGE_JSON, main: 'index.js' }))
    expect(pkg.mainScript).toBe(path.join(TEST_CLI_HOME_PATH, 'node_modules', TEST_PACKAGE_NAME, 'index.js'))
  })
})
