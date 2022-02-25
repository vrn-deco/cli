import { isFunction, noop } from '../index.js'

describe('@vrn-deco/cli-shared -> index.ts', () => {
  it('noop is a function', () => {
    expect(isFunction(noop)).toBe(true)
  })

  it('noop has no return value', () => {
    expect(noop()).toBeUndefined()
  })
})
