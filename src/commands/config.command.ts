/*
 * @Author: Cphayim
 * @Date: 2020-09-11 15:38:07
 * @LastEditTime: 2020-10-09 09:45:23
 * @Description: Config 命令
 */

import YAML from 'yaml'
import { Command } from 'commander'
import { Logger } from '@naughty/logger'

import { CommandDecorator, BaseCommand } from './base'
import ConfigService from '@/services/config.service'

const examples = `
Examples:
  vrn config get
  vrn config get registry
  vrn config set registry http://127.0.0.1:9999/boilerplate
`

@CommandDecorator({
  name: 'config <get|set> [key] [value]',
  description: `查看/修改配置\n${examples}`,
  options: [],
  actionHandler(...args) {
    this.boot(...args)
  },
})
export default class ConfigCommand extends BaseCommand {
  // 当前命令的 command 对象
  cmd: Command
  configService: ConfigService

  // 注册当前命令到父命令，由 Commander 装饰器实现
  registerTo(parent: Command): void {}

  // 启动器
  boot(subCommand: string, key: string, value: string, cmd: Command): void {
    this.cmd = cmd
    this.configService = new ConfigService()

    try {
      switch (subCommand) {
        case 'get':
          return this.handleGet(key)
        case 'set':
          return this.handleSet(key, value)
        default:
          throw new Error(`${subCommand} 不是有效的子命令 <get|set>`)
      }
    } catch (error) {
      Logger.error(error.message)
      process.exit(1)
    }
  }

  private handleGet(key: string) {
    const config = this.configService.getAll()
    if (!key) {
      Logger.info(`当前 .vrnconfig 配置如下 \n\n${YAML.stringify(config)}`)
    } else {
      Logger.info(`${key} -> ${config[key]}`)
    }
  }

  private handleSet(key: string, value: string) {
    Logger.success(`${key} -> ${value}`)
  }
}
