import { Command } from '@vrn-deco/cli-command'
import listCommand from '../../list/list.command.js'

describe('@vrn-deco/cli-command-boilerplate -> list -> list.command.ts', () => {
  test('Correct exported', () => {
    expect(listCommand).toBeInstanceOf(Command)
  })
})
