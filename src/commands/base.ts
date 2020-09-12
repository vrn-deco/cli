/*
 * @Author: Cphayim
 * @Date: 2020-09-11 16:37:24
 * @LastEditTime: 2020-09-13 01:50:36
 * @Description:
 */

import { CommanderStatic } from 'commander'

/**
 * 命令执行器抽象类
 */
export abstract class BaseCommand {
  /**
   * 实现一个注册命令的方法
   * @param commander
   */
  abstract register(commander: CommanderStatic): void

  /**
   * 启动器
   */
  abstract boot(...args: any): void
}

interface CommanderConfig {
  /**
   * 命令名称
   *
   * 'create'
   *
   * 'start <app_name>'
   */
  name: string
  /**
   * 命令描述
   */
  description: string
  /**
   * 选项参数
   */
  options: CommanderOption[]
  /**
   * 命令处理器
   *
   * 装饰器会将 this 绑定到 BaseCommand 类的子类上，并调用 boot 方法
   */
  actionHandler<T extends BaseCommand>(
    this: T,
    ...args: any[]
  ): void | Promise<void>
}

interface CommanderOption {
  flags: string
  description: string
  default?: any
}

export function CommandDecorator(config: CommanderConfig): ClassDecorator {
  return (target) => {
    target.prototype.register = function (commander: CommanderStatic) {
      const sub = commander.command(config.name)
      config.options.forEach((option) =>
        sub.option(option.flags, option.description, option.default),
      )
      sub
        .description(config.description)
        .action(config.actionHandler.bind(this))
    }
  }
}
