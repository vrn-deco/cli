import { Command } from '@vrn-deco/cli-command'
import BoilerplateCommand, { createCommand } from '../index.js'

describe('@vrn-deco/cli-command-boilerplate -> index.ts', () => {
  test('Correct exported', () => {
    expect(BoilerplateCommand).toBeInstanceOf(Command)
    expect(createCommand).toBeInstanceOf(Command)
  })
})
