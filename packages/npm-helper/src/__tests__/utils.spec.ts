import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { logger } from '@vrn-deco/cli-log'

import { isDistTagVersion, isPackage, parseModuleMap } from '../utils.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('@vrn-deco/cli-npm-helper -> utils.ts -> isPackage', () => {
  it('can verify a directory is a package', () => {
    expect(isPackage(__dirname)).toBe(false)
    expect(isPackage(path.join(__dirname, '..', '..'))).toBe(true)
  })
})

describe('@vrn-deco/cli-npm-helper -> utils.ts -> parseModuleMap', () => {
  beforeAll(() => {
    vi.spyOn(logger, 'warn').mockImplementation(() => void 0)
  })
  afterAll(() => {
    vi.restoreAllMocks()
  })

  beforeEach(() => {
    process.env.VRN_CLI_MODULE_MAP = ''
  })

  it('When VRN_CLI_MODULE is not define, an empty object should be returned', () => {
    expect(parseModuleMap()).toEqual({})
  })

  it('When VRN_CLI_MODULE is not a valid JSON, an empty object should be returned', () => {
    process.env.VRN_CLI_MODULE_MAP = '{ @vrn-deco/boilerplate-manifest: "/data/vrn-deco/boilerplate/manifest" }'
    expect(parseModuleMap()).toEqual({})
    expect(logger.warn).toHaveBeenCalledTimes(1)
  })

  it('When VRN_CLI_MODULE is a valid JSON, an object should be returned', () => {
    process.env.VRN_CLI_MODULE_MAP = '{ "@vrn-deco/boilerplate-manifest": "/data/vrn-deco/boilerplate/manifest" }'
    expect(parseModuleMap()).toEqual({ '@vrn-deco/boilerplate-manifest': '/data/vrn-deco/boilerplate/manifest' })
  })
})

describe('@vrn-deco/cli-npm-helper -> utils.ts -> isDistTagVersion', () => {
  it('can verify a version is a dist tag', () => {
    expect(isDistTagVersion('latest')).toBe(true)
    expect(isDistTagVersion('next')).toBe(true)
    expect(isDistTagVersion('beteee')).toBe(false)
    expect(isDistTagVersion('v1.0.0')).toBe(false)
  })
})
