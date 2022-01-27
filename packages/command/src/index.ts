/*
 * @Author: Cphayim
 * @Date: 2021-06-22 00:27:10
 * @Description: 命令
 */
import { Command } from 'commander'

export * from 'commander'
export { prompt } from 'inquirer'
export * from './action'

export function registerCommands(parent: Command, children: Command[]): Command {
  children.forEach((command) => parent.addCommand(command))
  return parent
}
