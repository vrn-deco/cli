/*
 * @Author: Cphayim
 * @Date: 2021-07-27 20:47:32
 * @Description: boilerplate create 命令
 */
import { Command } from '@vrn-deco/command'
import factory, { CreateActionArgs } from './action'

const createCommand = new Command('create')

createCommand
  .description('创建项目')
  .arguments('<folder_name> [base_directory]')
  .option('-f, --force', '当目录存在时强制覆盖', false)
  .option('-y, --yes', '无交互模式', false)
  .option('-n, --name [name]', '项目名称，用于无交互模式')
  .option('-v, --version [version]', '项目版本号，用于无交互模式')
  .option('-a, --author [author]', '开发人员，用于无交互模式')
  .option('-b, --boilerplate', '模板名，用于无交互模式')
  .action(async (...args: CreateActionArgs) => {
    await factory(...args).run()
  })

export default createCommand
