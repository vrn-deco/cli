/*
 * @Author: Cphayim
 * @Date: 2021-07-26 00:52:10
 * @Description: boilerplate services command
 */
import { Command } from '@vrn-deco/cli-command'

import createCommand from './create/create.command.js'
import listCommand from './list/list.command.js'

const boilerplateCommand = new Command('boilerplate')

boilerplateCommand
  .alias('boi')
  .description('boilerplate services')
  .addCommand(createCommand) //
  .addCommand(listCommand) //

export default boilerplateCommand

// frequently used subcommands
export { createCommand }
