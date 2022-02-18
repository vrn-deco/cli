/*
 * @Author: Cphayim
 * @Date: 2021-06-22 00:27:10
 * @Description: command tools
 */
import { Command } from 'commander'

export * from 'commander'
export { prompt } from 'inquirer'
export * from './action'

/**
 * register sub commands to parent command, return parent command
 */
export function registerCommands(parent: Command, children: Command[]): Command {
  children.forEach((command) => parent.addCommand(command))
  return parent
}
