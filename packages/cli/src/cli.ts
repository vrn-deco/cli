/*
 * @Author: Cphayim
 * @Date: 2021-06-18 02:08:20
 * @Description: cli
 */

import { logger } from '@vrn-deco/logger'
import { Command } from '@vrn-deco/command'

import configCommand from '@vrn-deco/command-config'

type CLIOptions = {
  debug: boolean
  local?: string
}

export function createCLI(): Command {
  const { VRN_CLI_PACKAGE_NAME, VRN_CLI_VERSION } = process.env
  const cli = new Command()

  cli
    .usage('<command> [options]')
    .option('--local <json>', '本地模块映射')
    .option('-d, --debug', '启用调试', false)
    .version(`${VRN_CLI_PACKAGE_NAME} version: ${VRN_CLI_VERSION}`, '-v, --version', '查看版本号')
    .helpOption('-h, --help', '查看帮助信息')

  cli.on('option:debug', () => {
    process.env.VRN_CLI_DEBUG_ENABLED = 'on'
    logger.setLevel(cli.opts().debug ? 'verbose' : 'info')
    logger.debug('调试模式启动')
  })

  cli.on('option:local', () => {
    console.log(cli.opts<CLIOptions>().local)
    process.env.VRN_CLI_LOCAL_MAP = ''
  })

  cli.on('command:*', (args) => {
    logger.warn(`无效命令: ${args[0]}`)
    const availableCommands = cli.commands.map((cmd) => cmd.name())
    logger.info(`可用命令: ${availableCommands.join(', ')}`)
  })

  // cli.action(() => cli.outputHelp())

  return cli
}

export function registerCommands(cli: Command): void {
  cli.addCommand(configCommand)
}
