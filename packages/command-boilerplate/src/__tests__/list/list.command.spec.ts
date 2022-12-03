import { describe, expect, it } from 'vitest'

import { Command } from '@vrn-deco/cli-command'

import listCommand from '../../list/list.command.js'

describe('@vrn-deco/cli-command-boilerplate -> list -> list.command.ts', () => {
  it('Correct exported', () => {
    expect(listCommand).toBeInstanceOf(Command)
  })
})
