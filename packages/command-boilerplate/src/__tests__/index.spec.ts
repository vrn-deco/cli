import { describe, expect, it } from 'vitest'

import { Command } from '@vrn-deco/cli-command'

import boilerplateCommand, { createCommand } from '../index.js'

describe('@vrn-deco/cli-command-boilerplate -> index.ts', () => {
  it('Correct exported', () => {
    expect(boilerplateCommand).toBeInstanceOf(Command)
    expect(createCommand).toBeInstanceOf(Command)
  })
})
