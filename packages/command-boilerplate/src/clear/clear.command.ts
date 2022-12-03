/*
 * @Author: Cphayim
 * @Date: 2022-05-16 11:21:43
 * @Description: boilerplate clear command
 */
import { Command, runAction } from '@vrn-deco/cli-command'

import { ClearAction } from './clear.action.js'

const listCommand = new Command()
export default listCommand

/**
 * e.g.
 * vrn boi clear
 */
listCommand
  .name('clear') //
  .description('clear boilerplate package dependency cache')
  .action(runAction(ClearAction))
