/*
 * @Author: Cphayim
 * @Date: 2021-07-27 20:47:32
 * @Description: boilerplate create command
 */
import { Command, runAction } from '@vrn-deco/cli-command'
import { CreateAction } from './action'

const createCommand = new Command('create')

/**
 * e.g.
 *
 * Interactive creation
 * vrn boi create myapp
 * vrn boi create myapp ./packages
 *
 * Non-interactive creation, suitable for CI and automation tasks
 * vrn boi create myapp --yes \
 *    --name=myapp --version=1.0.0 --author=cphayim \
 *    --target @vrn-deco/boilerplate-javascript-vue
 *
 * vrn boi create myapp ./packages --yes \
 *    --name=@vrn-deco/myapp --version=1.0.0 --author=cphayim \
 *    --target @vrn-deco/boilerplate-javascript-vue
 */
createCommand
  .description('create a new project with boilerplate service')
  .arguments('<folder_name> [base_directory]')
  .option('-f, --force', 'force overwrite when directory exists', false)
  .option('-y, --yes', 'non-interactive creation, suitable for ci or automated tasks', false)
  .option('-n, --name <name>', 'project name，need `--yes` options')
  .option('-v, --version <version>', 'project version，need `--yes` options')
  .option('-a, --author <author>', 'project author，need `--yes` options')
  .option('--target, --target-boilerplate <boilerplate_name>', 'target boilerplate name，need `--yes` options')
  .action(runAction(CreateAction))

export default createCommand
