/*
 * @Author: Cphayim
 * @Date: 2021-07-27 20:47:32
 * @Description: boilerplate create command
 */
import { Command, Option, runAction } from '@vrn-deco/cli-command'
import { logger } from '@vrn-deco/cli-log'

import { DEFAULT_MANIFEST_PACKAGE, Mode } from '../common.js'
import { CreateOptions } from './create.action.js'
import { PackageCreateAction } from './package-create.action.js'

const createCommand = new Command()
export default createCommand

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
  .name('create')
  .description('create a new project with boilerplate service')
  .arguments('<folder_name> [base_directory]')
  .addOption(
    new Option('--mode <name>', 'mode of creation').choices([Mode.Package, Mode.Http, Mode.Git]).default(Mode.Package),
  )
  .option('-y, --yes', 'non-interactive creation, suitable for ci or automated tasks', false)
  .option('-n, --name <name>', 'project name, need `--yes` options')
  .option('-v, --version <version>', 'project version, need `--yes` options')
  .option('-a, --author <author>', 'project author, need `--yes` options')
  .option('--target, --target-boilerplate <boilerplate_name>', 'target boilerplate name, need `--yes` options')
  .option('--manifest-package <package_name>', 'specify manifest-package', DEFAULT_MANIFEST_PACKAGE)
  .action(runActionByMode)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function runActionByMode(...args: any[]) {
  const opts: CreateOptions = args[args.length - 2]
  logger.verbose('mode: ', opts.mode)
  const modeActionClassMap: Record<Mode, typeof PackageCreateAction> = {
    [Mode.Package]: PackageCreateAction,
    [Mode.Http]: PackageCreateAction,
    [Mode.Git]: PackageCreateAction,
  }
  const klass = modeActionClassMap[opts.mode]
  await runAction(klass)(...args)
}
