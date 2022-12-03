/*
 * @Author: Cphayim
 * @Date: 2021-06-26 00:58:09
 * @Description: config command
 */
import { Command, runAction } from '@vrn-deco/cli-command'

import { ConfigAction } from './action.js'

const configCommand = new Command('config')

/**
 * e.g.
 * vrn config
 * vrn config --read
 * vrn config --read --json
 * vrn config --read --yaml
 * vrn config --reset
 */
configCommand.description('view or update configuration').action(runAction(ConfigAction))

export default configCommand
