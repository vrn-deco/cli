import os from 'node:os'
import { jest } from '@jest/globals'

import { isFunction, noop, cmdExists } from '../index.js'

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
})
