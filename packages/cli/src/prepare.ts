/*
 * @Author: Cphayim
 * @Date: 2021-06-18 01:28:41
 * @Description: 准备工作
 */
import path from 'path'
import os from 'os'
import fs from 'fs-extra'
import dotenv from 'dotenv'
import semver from 'semver'
import rootCheck from 'root-check'

import { figlet, colors, logger } from '@vrn-deco/cli-log'
import { checkUpdate } from '@vrn-deco/cli-check-update'

const pkg = fs.readJsonSync(path.resolve(__dirname, '..', 'package.json'))
const userHome = os.homedir()

export async function prepare(): Promise<void> {
  checkUserHome()
  initialEnv()
  printLOGO()
  rootDemotion()
  checkNodeVersion()
  await checkUpdate()
}

function initialEnv() {
  const envPath = path.join(userHome, '.env')
  if (fs.existsSync(envPath) && fs.statSync(envPath).isFile()) dotenv.config({ path: envPath })
  injectDefaultEnv()
}

function injectDefaultEnv() {
  process.env = {
    ...process.env,
    /**
     * @see [[global.d.ts]]
     */
    VRN_CLI_DEBUG_ENABLED: process.env.VRN_CLI_DEBUG_ENABLED ?? SwitchStatus.Off,
    VRN_CLI_NAME: 'vrn-cli',
    VRN_CLI_PACKAGE_NAME: pkg.name,
    VRN_CLI_VERSION: pkg.version,
    VRN_CLI_HOME_PATH: path.resolve(userHome, '.vrn-cli'),
    VRN_CLI_LOWEST_NODE_VERSION:
      semver.valid(pkg?.engines?.node?.match(/(?<version>\d+\.\d+\.\d+)/).groups.version) ?? '12.20.0',
    VRN_CLI_MODULE_MAP: '',
  }
}

function printLOGO() {
  logger.clearConsole()
  const logo = figlet.textSync(process.env.VRN_CLI_NAME.toUpperCase(), '3D Diagonal')
  console.log(colors.green(logo))
}

function rootDemotion() {
  if (process.env.SUDO_USER) rootCheck()
}

function checkNodeVersion() {
  const current = process.version
  const lowest = process.env.VRN_CLI_LOWEST_NODE_VERSION
  if (semver.lt(process.version, lowest)) {
    throw new Error(`请更新你的 Node.js 版本 \n最低要求: ${lowest}\n当前版本: ${current}`)
  }
}

function checkUserHome() {
  if (!userHome || !fs.pathExistsSync(userHome)) {
    throw new Error(`当前计算机用户 ${os.userInfo().username} 主目录不存在`)
  }
}
