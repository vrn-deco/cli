import { describe, expect, it } from 'vitest'

import { gradient } from '../utils.js'

describe('@vrn-deco/cli -> utils.ts', () => {
  it('can be return a gradient string', () => {
    expect(gradient('abcdefg')).toBeTypeOf('string')
  })
})
