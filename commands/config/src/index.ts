/*
 * @Author: Cphayim
 * @Date: 2021-06-26 00:58:09
 * @Description: 配置命令
 */
import { Command } from '@vrn-deco/command'
import factory, { ConfigActionArgs } from './action'

const configCommand = new Command('config')

configCommand.description('配置命令行工具').action(async (...args: ConfigActionArgs) => {
  await factory(...args).run()
})

export default configCommand
