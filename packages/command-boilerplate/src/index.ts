/*
 * @Author: Cphayim
 * @Date: 2021-07-26 00:52:10
 * @Description: 模板库服务命令
 */
import { Command } from '@vrn-deco/cli-command'

import createCommand from './create'
import listCommand from './list'

const boilerplateCommand = new Command('boilerplate')

boilerplateCommand
  .alias('boi')
  .description('模板库服务')
  .addCommand(createCommand) //
  .addCommand(listCommand) //

export default boilerplateCommand

// frequently used subcommands
export { createCommand }
