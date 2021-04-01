/*
 * @Author: Cphayim
 * @Date: 2020-09-11 15:56:37
 * @LastEditTime: 2021-04-01 16:35:54
 * @Description:
 */
import commander from 'commander'

import { BaseCommand } from './base'
import ConfigCommand from './config.command'
import CreateCommand from './create.command'

/**
 * 注册所有命令
 * @param commander
 */
export function registerCommanders(commander: commander.Command) {
  const commands: BaseCommand[] = [new CreateCommand(), new ConfigCommand()]
  commands.forEach((command) => command.registerTo(commander))
}
