/*
 * @Author: Cphayim
 * @Date: 2021-06-18 01:03:57
 * @Description: entry
 */
import { logger } from '@vrn-deco/cli-log'

import { createCLI } from './cli.js'
import commands from './commands.js'
import { prepare } from './prepare.js'

// To test the branch, wrapper functions are used instead of top-level await
export async function main() {
  try {
    await prepare()
    await createCLI(commands).parseAsync(process.argv)
  } catch (error) {
    if (process.env.VRN_CLI_DEBUG_ENABLED === 'on') {
      logger.error(error)
    } else {
      logger.error(error.message)
    }
  }
}
