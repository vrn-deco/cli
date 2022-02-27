import { Command } from '@vrn-deco/cli-command'
import { isArray } from '@vrn-deco/cli-shared'
import commands from '../commands.js'

describe('@vrn-deco/cli -> commands.ts', () => {
  test('Correct exported commands', () => {
    expect(isArray(commands)).toBeTruthy()
    expect(() => commands.every((command) => command instanceof Command)).toBeTruthy()
  })
})
