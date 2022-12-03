/*
 * @Author: Cphayim
 * @Date: 2021-06-18 02:08:20
 * @Description: cli
 */
import path from 'node:path'

import fs from 'fs-extra'

import { Command, registerCommands } from '@vrn-deco/cli-command'
import { logger } from '@vrn-deco/cli-log'
import { isObject } from '@vrn-deco/cli-shared'

import { gradient } from './utils.js'

type CLIOptions = {
  // debug: boolean
  moduleMap: string
  moduleMapFile: string
}

export function createCLI(commands?: Command[]): Command {
  const { VRN_CLI_PACKAGE_NAME, VRN_CLI_VERSION } = process.env
  const cli = new Command()

  cli
    // .option('--debug', 'enable debug', false)
    .option('--module-map <json>', 'local module mapping')
    .option('--module-map-file <json-file>', 'local module mapping file')
    .version(gradient(`${VRN_CLI_PACKAGE_NAME} version: ${VRN_CLI_VERSION}`), '-v, --version', 'display version')

  cli.on('option:module-map', () => {
    logger.verbose('received --module-map option', 'MODULE_MAP')
    injectModuleMapEnv(cli.opts<CLIOptions>().moduleMap)
  })

  cli.on('option:module-map-file', () => {
    const { moduleMap, moduleMapFile } = cli.opts<CLIOptions>()
    // moduleMap has higher priority
    if (moduleMap) return

    logger.verbose('received --module-map-file option', 'MODULE_MAP')
    const file = path.resolve(process.cwd(), moduleMapFile)
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      throw new Error(`moduleMapFile does not exist: ${file}`)
    }
    injectModuleMapEnv(fs.readFileSync(file, { encoding: 'utf-8' }))
  })

  cli.on('command:*', (args) => {
    logger.warn(`Invalid command: ${args[0]}`)
    const availableCommands = cli.commands.map((cmd) => cmd.name())
    logger.info(`Available commands: ${availableCommands.join(', ')}`)
  })

  if (commands) {
    registerCommands(cli, commands)
  }

  return cli
}

function injectModuleMapEnv(moduleMap: string) {
  try {
    // try to parse json
    if (!isObject(JSON.parse(moduleMap))) {
      throw new Error()
    }
    process.env.VRN_CLI_MODULE_MAP = moduleMap
    logger.verbose(`enabled local module mapping: \n${process.env.VRN_CLI_MODULE_MAP}`, 'MODULE_MAP')
  } catch (error) {
    throw new Error('invalid local module mapping, please check format')
  }
}
