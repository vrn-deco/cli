import { Command } from '@vrn-deco/cli-command'
import ConfigCommand from '../index.js'

describe('@vrn-deco/cli-command-config -> index.ts', () => {
  test('Correct exported', () => {
    expect(ConfigCommand).toBeInstanceOf(Command)
  })
})
