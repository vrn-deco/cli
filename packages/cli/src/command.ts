/*
 * @Author: Cphayim
 * @Date: 2021-06-18 02:08:20
 * @Description: 注册命令
 */

import { Command } from 'commander'
import '@vrn-deco/shared-types/lib/env'
import { logger } from '@vrn-deco/logger'

import { CLI_PACKAGE_NAME, CLI_VERSION } from './constants'

const program = new Command()

export async function registerCommands(): Promise<void> {
  program
    .usage('<command> [options]')
    .version(`${CLI_PACKAGE_NAME} version: ${CLI_VERSION}`, '-v, --version', '查看版本号')
    .helpOption('-h, --help', '查看帮助信息')
    .option('-d, --debug', '是否开启调试模式', false)
    .option('-tp, --targetPath <targetPath>', '指定本地模块路径', '')

  program.on('option:debug', () => {
    process.env.VRN_CLI_DEBUG_ENABLED = 'on'
    logger.setLevelValue(program.opts().debug ? 'verbose' : 'info')
    logger.verbose('调试模式启动')
  })

  program.on('option:targetPath', () => {
    process.env.CLI_TARGET_PATH = program.opts().targetPath
  })

  program.on('command:*', (args) => {
    logger.warn(`无效命令: ${args[0]}`)
    const availableCommands = program.commands.map((cmd) => cmd.name())
    logger.info(`可用命令: ${availableCommands.join(', ')}`)
  })

  await program.parseAsync(process.argv)

  // 没有命令的情况下打印帮助信息
  if (program.args && program.args.length < 1) {
    program.outputHelp()
  }
}
