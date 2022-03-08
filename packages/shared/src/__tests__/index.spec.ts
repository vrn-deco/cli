import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import { jest } from '@jest/globals'

import { isFunction, noop, cmdExists, dynamicImport } from '../index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('@vrn-deco/cli-shared -> index.ts', () => {
  it('noop is a function', () => {
    expect(isFunction(noop)).toBe(true)
  })

  it('noop has no return value', () => {
    expect(noop()).toBeUndefined()
  })

  it('can verify a command exists', () => {
    expect(cmdExists('npm')).toBe(true)
    expect(cmdExists('nnnnpm')).toBe(false)
    const spy = jest.spyOn(os, 'platform').mockImplementation(() => 'win32')
    expect(cmdExists('nnnnpm')).toBe(false)
    spy.mockRestore()
  })

  it('can dynamic import a esm file', async () => {
    const file = path.join(__dirname, 'test-import.js')
    const { test } = await dynamicImport(file)
    expect(test).toBeInstanceOf(Function)
  })
})
