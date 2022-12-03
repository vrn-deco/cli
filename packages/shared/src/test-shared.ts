/*
 * @Author: Cphayim
 * @Date: 2022-03-05 04:31:03
 * @Description: test env used
 */
import os from 'node:os'
import path from 'node:path'

import { SwitchStatus } from './enum.js'

export function injectTestEnv(debugEnabled = false) {
  process.env = {
    ...process.env,
    VRN_CLI_DEBUG_ENABLED: debugEnabled ? SwitchStatus.On : SwitchStatus.Off,
    VRN_CLI_NAME: 'vrn-cli-test',
    VRN_CLI_PACKAGE_NAME: '@vrn-deco/cli-test',
    VRN_CLI_VERSION: '1.0.0',
    VRN_CLI_HOME_PATH: path.resolve(os.homedir(), '.vrn-deco.test'),
    VRN_CLI_LOWEST_NODE_VERSION: '^12.20.0 || ^14.13.1 || >=16.0.0',
    VRN_CLI_MODULE_MAP: '',
  }
}
