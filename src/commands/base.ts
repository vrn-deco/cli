/*
 * @Author: Cphayim
 * @Date: 2020-09-11 16:37:24
 * @LastEditTime: 2020-09-14 10:39:25
 * @Description:
 */

import commander, { Command } from 'commander'

/**
 * 命令执行器抽象类
 */
export abstract class BaseCommand {
  /**
   * 注册当前命令到父命令
   * @param commander
   */
  abstract registerTo(parent: commander.Command): void

  /**
   * 启动器
   */
  abstract boot(...args: any): void

  /**
   * 添加子命令
   */
  addSubCommands(cmd: Command): void {}
}

interface CommandConfig {
  /**
   * 命令名称
   */
  name: string
  /**
   * 命令描述
   */
  description: string
  /**
   * 选项参数
   */
  options: CommandOption[]
  /**
   * 命令处理器
   *
   * 装饰器会将 this 绑定到 BaseCommand 类的子类上，并调用 boot 方法
   */
  actionHandler<T extends BaseCommand>(this: T, ...args: any[]): void | Promise<void>
}

interface CommandOption {
  flags: string
  description: string
  default?: any
}

/**
 * 命令装饰器
 *
 * 重写 registerTo 方法实现注册命令
 * @type 类装饰器
 */
export function CommandDecorator(conf: CommandConfig): ClassDecorator {
  return (target) => {
    target.prototype.registerTo = function (parent: Command) {
      // 在父命令上创建当前命令
      const cmd = parent.command(conf.name)
      conf.options.forEach((option) =>
        cmd.option(option.flags, option.description, option.default),
      )
      cmd.description(conf.description).action(conf.actionHandler.bind(this))
      this.addSubCommands(cmd)
    }
  }
}
