/*
 * @Author: Cphayim
 * @Date: 2021-06-18 01:03:57
 * @Description: 启动器
 */
import { log } from '@vrn-deco/log'

import { prepare } from './prepare'
import { registerCommands } from './command'

export async function boot(): Promise<void> {
  try {
    await prepare()
    await registerCommands()
  } catch (error) {
    log.error('', error.message)
    if (process.env.VRN_CLI_DEBUG) {
      log.error('', error.stack)
    }
  }
}
