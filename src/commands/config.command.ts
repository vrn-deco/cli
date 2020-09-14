/*
 * @Author: Cphayim
 * @Date: 2020-09-11 15:38:07
 * @LastEditTime: 2020-09-14 11:07:28
 * @Description: Create 命令
 */
import YAML from 'yaml'
import { Command } from 'commander'

import { CommandDecorator, BaseCommand } from './base'
import { Logger } from '@naughty/logger'
import { VRN_CONFIG, VRN_CONFIG_FILE } from '@/config'
import { writeFileSync } from 'fs'

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

  // 注册当前命令到父命令，由 Commander 装饰器实现
  registerTo(parent: Command): void {}
  // 启动器
  boot(subCommand: string, key: string, value: string, cmd: Command): void {
    this.cmd = cmd
    try {
      switch (subCommand) {
        case 'get':
          return this._handleGet(key)
        case 'set':
          return this._handleSet(key, value)
        default:
          throw new Error(`${subCommand} 不是有效的子命令 <get|set>`)
      }
    } catch (error) {
      Logger.error(error.message)
      process.exit(1)
    }
  }

  // 处理获取
  private _handleGet(key: string) {
    // 获取所有 .vrnconfig 配置
    if (!key) throw new Error(`当前 .vrnconfig 配置如下 \n\n${YAML.stringify(VRN_CONFIG)}`)
    // 获取单条 .vrnconfig 配置
    Logger.info(`${key} -> ${VRN_CONFIG[key]}`)
  }

  // 处理设置
  private _handleSet(key: string, value: string) {
    if (!key || !value) throw new Error('key 和 value 参数对于 set 子命令是必要的')
    VRN_CONFIG[key] = value
    writeFileSync(VRN_CONFIG_FILE, YAML.stringify(VRN_CONFIG))
    Logger.success(`${key} -> ${value}`)
  }
}
