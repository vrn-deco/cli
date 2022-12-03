import { describe, expect, it } from 'vitest'

import { Command } from '@vrn-deco/cli-command'

import clearCommand from '../../clear/clear.command.js'

describe('@vrn-deco/cli-command-boilerplate -> clear -> clear.command.ts', () => {
  it('Correct exported', () => {
    expect(clearCommand).toBeInstanceOf(Command)
  })
})
