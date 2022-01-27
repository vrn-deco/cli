/*
 * @Author: Cphayim
 * @Date: 2021-06-18 02:08:20
 * @Description: cli
 */

import path from 'path'
import fs from 'fs-extra'

import { logger } from '@vrn-deco/cli-log'
import { Command, registerCommands } from '@vrn-deco/cli-command'
import { isObject } from '@vrn-deco/cli-shared'

type CLIOptions = {
  debug: boolean
  moduleMap: string
  moduleMapFile: string
}

export function createCLI(commands?: Command[]): Command {
  const { VRN_CLI_PACKAGE_NAME, VRN_CLI_VERSION } = process.env
  const cli = new Command()

  cli
    .usage('<command> [options]')
    .option('--debug', '启用调试', false)
    .option('--module-map <json>', '模块映射')
    .option('--module-map-file <json-file>', '模块映射文件')
    .version(`${VRN_CLI_PACKAGE_NAME} version: ${VRN_CLI_VERSION}`, '-v, --version', '查看版本号')
    .helpOption('-h, --help', '查看帮助信息')

  // 启用调试
  cli.on('option:debug', () => {
    process.env.VRN_CLI_DEBUG_ENABLED = SwitchStatus.On
    logger.setLevel(cli.opts().debug ? 'verbose' : 'info')
    logger.debug('启用调试')
  })

  // 本地模块映射加载
  cli.on('option:module-map', () => {
    logger.debug('接收 --module-map 选项', 'MODULE_MAP')
    injectModuleMapEnv(cli.opts<CLIOptions>().moduleMap)
  })

  // 本地模块映射文件加载
  cli.on('option:module-map-file', () => {
    const { moduleMap, moduleMapFile } = cli.opts<CLIOptions>()
    // moduleMap 的优先级更高
    if (moduleMap) return

    logger.debug('接收 --module-map-file 选项', 'MODULE_MAP')
    const file = path.resolve(process.cwd(), moduleMapFile)
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      throw new Error(`本地模块映射文件不存在: ${file}`)
    }
    injectModuleMapEnv(fs.readFileSync(file, { encoding: 'utf-8' }))
  })

  // 无效命令提示
  cli.on('command:*', (args) => {
    logger.warn(`无效命令: ${args[0]}`)
    const availableCommands = cli.commands.map((cmd) => cmd.name())
    logger.info(`可用命令: ${availableCommands.join(', ')}`)
  })

  // cli.action(() => cli.outputHelp())

  if (commands) {
    registerCommands(cli, commands)
  }

  return cli
}

function injectModuleMapEnv(moduleMap: string) {
  try {
    // 试解析
    if (!isObject(JSON.parse(moduleMap))) {
      throw new Error()
    }
    process.env.VRN_CLI_MODULE_MAP = moduleMap
    logger.debug(`启用本地模块映射: \n${process.env.VRN_CLI_MODULE_MAP}`, 'MODULE_MAP')
  } catch (error) {
    throw new Error('无效的本地模块映射，请检查格式')
  }
}
