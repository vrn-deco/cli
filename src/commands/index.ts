/*
 * @Author: Cphayim
 * @Date: 2020-09-11 15:56:37
 * @LastEditTime: 2020-09-14 10:21:41
 * @Description:
 */
import commander from 'commander'

import { BaseCommand } from './base'
import CreateCommand from './create.command'
import ConfigCommand from './config.command'

/**
 * 注册所有命令
 * @param commander
 */
export function registerCommanders(commander: commander.Command) {
  const commands: BaseCommand[] = [new CreateCommand(), new ConfigCommand()]
  commands.forEach((command) => command.registerTo(commander))
}
