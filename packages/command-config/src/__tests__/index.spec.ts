import { describe, expect, it } from 'vitest'

import { Command } from '@vrn-deco/cli-command'

import ConfigCommand from '../index.js'

describe('@vrn-deco/cli-command-config -> index.ts', () => {
  it('Correct exported', () => {
    expect(ConfigCommand).toBeInstanceOf(Command)
  })
})
