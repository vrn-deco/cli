import { beforeAll, describe, expect, it } from 'vitest'

import { Command } from '@vrn-deco/cli-command'

import commands from '../commands.js'
import { initialEnv } from '../prepare.js'

const { createCLI } = await import('../cli.js')
const MOCK_ARGV = ['node', 'vrn']

beforeAll(() => {
  initialEnv()
})

describe('@vrn-deco/cli -> cli.ts', () => {
  it('Can create a cli', () => {
    const cli = createCLI()
    expect(cli).toBeInstanceOf(Command)
  })

  it('Can create a cli and register child commands', () => {
    const cli = createCLI(commands)
    expect(cli).toBeInstanceOf(Command)
    expect(cli.commands.length).toBe(commands.length)
  })

  it('When --module-map is a valid json, will inject it to env', async () => {
    const moduleMap = '{ "@vrn-deco/test": "/root/test" }'
    const cli = createCLI()
    await cli.parseAsync([...MOCK_ARGV, '--module-map', moduleMap])
    expect(process.env.VRN_CLI_MODULE_MAP).toEqual(moduleMap)
  })

  it('When --module-map is a invalid json, will throw a error', async () => {
    expect.assertions(1)
    const moduleMap = '{ @vrn-deco/test: "/root/test" }'
    const cli = createCLI()
    try {
      await cli.parseAsync([...MOCK_ARGV, '--module-map', moduleMap])
    } catch (error) {
      expect(error).toEqual(new Error('invalid local module mapping, please check format'))
    }
  })

  it('When --module-map is a json object, will throw a error', async () => {
    expect.assertions(1)
    const moduleMap = '[]'
    const cli = createCLI()
    try {
      await cli.parseAsync([...MOCK_ARGV, '--module-map', moduleMap])
    } catch (error) {
      expect(error).toEqual(new Error('invalid local module mapping, please check format'))
    }
  })
})
