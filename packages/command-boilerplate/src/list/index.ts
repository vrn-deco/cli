/*
 * @Author: Cphayim
 * @Date: 2021-07-29 16:09:40
 * @Description: boilerplate list|ls 命令
 */
import { Command } from '@vrn-deco/cli-command'
import { ListAction, ListActionArgs } from './action'

const listCommand = new Command('list')

listCommand
  .alias('ls')
  .description('列出模板清单')
  .option('--json', '打印 json 格式', false)
  .option('--yml, --yaml', '打印 yaml 格式', false)
  .option('-o, --out-file <file>', '输出到文件')
  .action(async (...args: ListActionArgs) => {
    await new ListAction(...args).run()
  })

export default listCommand
