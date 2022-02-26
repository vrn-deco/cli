import { Command, prompt, registerCommands } from '../index.js'

describe('@vrn-deco/cli-command -> index.ts', () => {
  test('Correct export', () => {
    expect(Command).toBeDefined()
    expect(prompt).toBeDefined()
    expect(registerCommands).toBeDefined()
  })

  test('can register children to parent command', () => {
    const parent = new Command('parent')
    const child1 = new Command('child1')
    const child2 = new Command('child2')
    expect(registerCommands(parent, [child1, child2])).toBe(parent)
  })
})
