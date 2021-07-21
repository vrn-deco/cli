/*
 * @Author: Cphayim
 * @Date: 2021-06-18 01:03:57
 * @Description: 启动器
 */
import '@vrn-deco/shared-types'
import { logger } from '@vrn-deco/logger'

import { prepare } from './prepare'
import { registerCommands } from './command'

export async function boot(): Promise<void> {
  try {
    await prepare()
    await registerCommands()
  } catch (error) {
    logger.error(error.message)
    if (process.env.VRN_CLI_DEBUG_ENABLED === 'on') {
      logger.error(error.stack)
    }
  }
}
