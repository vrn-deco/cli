import { describe, expect, it } from 'vitest'
import { logger, figlet, boxen, colors, dedent } from '../index.js'

describe('@vrn-deco/log -> index.ts', () => {
  it('commonjs to esm named exports correctly', () => {
    expect(logger).toBeDefined()
    expect(figlet).toBeDefined()
    expect(boxen).toBeDefined()
    expect(colors).toBeDefined()
    expect(dedent).toBeDefined()
  })
})
