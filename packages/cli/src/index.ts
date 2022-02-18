/*
 * @Author: Cphayim
 * @Date: 2021-06-18 01:03:57
 * @Description: entry
 */
import { logger } from '@vrn-deco/cli-log'

import commands from './commands'
import { prepare } from './prepare'
import { createCLI } from './cli'

export async function main(): Promise<void> {
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
