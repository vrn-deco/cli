/*
 * @Author: Cphayim
 * @Date: 2021-06-22 00:27:10
 * @Description: command tools
 */
import type { Command } from 'commander'
import inquirer from 'inquirer'

// Commonjs to ESM named export
const { prompt } = inquirer
export { prompt }

export * from 'commander'
export * from './action.js'

/**
 * register sub commands to parent command, return parent command
 */
export function registerCommands(parent: Command, children: Command[]): Command {
  children.forEach((command) => parent.addCommand(command))
  return parent
}
