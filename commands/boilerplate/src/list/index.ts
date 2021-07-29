/*
 * @Author: Cphayim
 * @Date: 2021-07-29 16:09:40
 * @Description: boilerplate list|ls 命令
 */
import { Command } from '@vrn-deco/command'
import factory, { ListActionArgs } from './action'

const listCommand = new Command('list')

listCommand
  .alias('ls')
  .description('列出模板清单')
  .option('--json', '输出 json', false)
  .option('--yml, --yaml', '输出 yaml', false)
  .option('-o, --out-file <file>', '输出内容到文件')
  .action(async (...args: ListActionArgs) => {
    await factory(...args).run()
  })

export default listCommand
