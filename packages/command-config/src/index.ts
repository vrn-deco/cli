/*
 * @Author: Cphayim
 * @Date: 2021-06-26 00:58:09
 * @Description: config command
 */
import { Command } from '@vrn-deco/cli-command'
import { ConfigAction, ConfigActionArgs } from './action'

const configCommand = new Command('config')

/**
 * e.g.
 * vrn config
 * vrn config --read
 * vrn config --read --json
 * vrn config --read --yaml
 * vrn config --reset
 */
configCommand.description('view or update configuration').action(async (...args: ConfigActionArgs) => {
  await new ConfigAction(...args).run()
})

export default configCommand
