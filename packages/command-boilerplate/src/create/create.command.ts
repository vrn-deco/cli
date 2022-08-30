/*
 * @Author: Cphayim
 * @Date: 2021-07-27 20:47:32
 * @Description: boilerplate create command
 */
import { Command, Option, runAction } from '@vrn-deco/cli-command'
import { logger } from '@vrn-deco/cli-log'

import { DEFAULT_API_BASE_URL, DEFAULT_MANIFEST_PACKAGE, Mode, PostGit } from '../common.js'
import type { CreateAction, CreateOptions } from './create.action.js'
import { GitCreateAction } from './git-create.action.js'
import { HTTPCreateAction } from './http-create.action.js'
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
  .arguments('[folder_name] [base_directory]')
  .addOption(
    new Option('--mode <name>', 'mode of creation').choices([Mode.Package, Mode.Http, Mode.Git]).default(Mode.Package),
  )
  .option('-y, --yes', 'non-interactive creation, suitable for ci or automated tasks', false)
  .option('--name <name>', 'project name, need `--yes` options')
  .option('--version <version>', 'project version, need `--yes` options')
  .option('--author <author>', 'project author, need `--yes` options')
  .option('--target, --target-boilerplate <boilerplate_name>', 'target boilerplate name, need `--yes` options')
  .option(
    '--manifest-package <package_name>',
    'specify manifest-package, only in `package` mode',
    DEFAULT_MANIFEST_PACKAGE,
  )
  .option('--api-url <url>', 'specify api base url, only in `http` mode', DEFAULT_API_BASE_URL)
  .addOption(
    new Option('--post-git <behavior>', 'handle original records after `git clone`, only in `git` mode')
      .choices([PostGit.Retain, PostGit.Remove, PostGit.Rebuild])
      .default(PostGit.Retain),
  )
  .option('-i, --auto-install-deps', 'only in `package` mode will install dependencies', false)
  .action(runActionByMode)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function runActionByMode(...args: any[]) {
  const options: CreateOptions = args[args.length - 2]
  logger.verbose(`Creation mode: ${options.mode}`)

  const modeActionClassMap: Record<Mode, typeof CreateAction> = {
    [Mode.Package]: PackageCreateAction,
    [Mode.Http]: HTTPCreateAction,
    [Mode.Git]: GitCreateAction,
  }

  const klass = modeActionClassMap[options.mode]
  await runAction(klass)(...args)
}
