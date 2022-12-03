import { describe, expect, it, vi } from 'vitest'

import { DistTag } from '../common.js'

const mockResponseJson = vi.fn()
vi.mock('node-fetch', () => ({
  default: vi.fn(() =>
    Promise.resolve({
      json: mockResponseJson,
    }),
  ),
}))

const {
  queryPackageInfo,
  queryPackageVersion,
  queryPackageLatestVersion,
  queryPackageNextVersion,
  queryPackageLegacyVersion,
} = await import('../querier.js')

const packageInfo = {
  name: '@vrn-deco/cli-exists',
  'dist-tags': {
    latest: '1.0.0',
    next: '1.0.2',
    legacy: '0.3.4',
  },
}

describe('@vrn-deco/cli-npm-helper -> querier.ts', () => {
  it('Query for a package that dose not exists, will throw error', async () => {
    const errorInfo = { error: 'not found' }
    mockResponseJson.mockReturnValueOnce(errorInfo)
    expect(async () => {
      await queryPackageInfo('@vrn-deco/cli-not-exists')
    }).rejects.toThrow('NPMQuery failed: package @vrn-deco/cli-not-exists not found')
  })

  it('Query for a package, will return the correct information', async () => {
    mockResponseJson.mockReturnValueOnce(packageInfo)
    const info = await queryPackageInfo('@vrn-deco/cli-exists')
    expect(info).toEqual(packageInfo)
  })

  it('Can query the package specified dist-tag version', async () => {
    mockResponseJson.mockReturnValueOnce(packageInfo)
    const version = await queryPackageVersion('@vrn-deco/cli-exists', DistTag.Latest)
    expect(version).toEqual(packageInfo['dist-tags'].latest)
  })

  it('Can query the package latest tag version', async () => {
    mockResponseJson.mockReturnValueOnce(packageInfo)
    const version = await queryPackageLatestVersion('@vrn-deco/cli-exists')
    expect(version).toEqual(packageInfo['dist-tags'].latest)
  })

  it('Can query the package next tag version', async () => {
    mockResponseJson.mockReturnValueOnce(packageInfo)
    const version = await queryPackageNextVersion('@vrn-deco/cli-exists')
    expect(version).toEqual(packageInfo['dist-tags'].next)
  })

  it('Can query the package legacy tag version', async () => {
    mockResponseJson.mockReturnValueOnce(packageInfo)
    const version = await queryPackageLegacyVersion('@vrn-deco/cli-exists')
    expect(version).toEqual(packageInfo['dist-tags'].legacy)
  })
})
