/*
 * @Author: Cphayim
 * @Date: 2021-06-18 02:08:20
 * @Description: 注册命令
 */

import { Command } from 'commander'
import { log } from '@vrn-deco/log'
import { CLI_VERSION } from './constants'

const program = new Command()

export async function registerCommands(): Promise<void> {
  program
    .usage('<command> [options]')
    .version(CLI_VERSION, '-v, --version', '查看版本号')
    .helpOption('-h, --help', '查看帮助信息')
    .option('-d, --debug', '是否开启调试模式', false)
    .option('-tp, --targetPath <targetPath>', '指定本地模块路径', '')

  program.on('option:debug', () => {
    log.level = process.env.LOG_LEVEL = program.opts().debug ? 'verbose' : 'info'
    process.env.VRN_CLI_DEBUG = 'enabled'
    log.verbose('debug', '调试模式启动')
  })

  program.on('option:targetPath', () => {
    process.env.CLI_TARGET_PATH = program.opts().targetPath
  })

  program.on('command:*', (args) => {
    log.warn('', `无效命令: ${args[0]}`)
    const availableCommands = program.commands.map((cmd) => cmd.name())
    log.info('', `可用命令: ${availableCommands.join(', ')}`)
  })

  await program.parseAsync(process.argv)

  // 没有命令的情况下打印帮助信息
  if (program.args && program.args.length < 1) {
    program.outputHelp()
  }
}
