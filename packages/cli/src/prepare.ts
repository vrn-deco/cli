/*
 * @Author: Cphayim
 * @Date: 2021-06-18 01:28:41
 * @Description: 准备工作
 */
import path from 'path'
import os from 'os'

import dotenv from 'dotenv'
import semver from 'semver'
import rootCheck from 'root-check'
import userHome from 'user-home'
import pathExists from 'path-exists'

import '@vrn-deco/shared-types/lib/env'
import { NPMQuerier, NPMRegistry } from '@vrn-deco/npm-helper'
import { figlet, colors, dedent, ora, logger } from '@vrn-deco/logger'

import {
  CLI_HOME_NAME,
  CLI_LOWEST_NODE_VERSION,
  CLI_NAME,
  CLI_PACKAGE_NAME,
  CLI_VERSION,
} from './constants'

export async function prepare(): Promise<void> {
  printLOGO()
  rootDemotion()
  checkNodeVersion()
  checkUserHome()
  checkEnv()
  await checkGlobalUpdate()
}

function printLOGO() {
  const logo = figlet.textSync(CLI_NAME.toUpperCase(), '3D Diagonal')
  console.log(colors.green(logo))
}

function rootDemotion() {
  rootCheck()
}

function checkNodeVersion() {
  const current = process.version
  const lowest = CLI_LOWEST_NODE_VERSION
  if (semver.lt(current, lowest)) {
    throw new Error(`请更新你的 Node.js 版本 \n最低要求: ${lowest}\n当前版本: ${current}`)
  }
}

function checkUserHome() {
  if (!userHome || !pathExists.sync(userHome)) {
    throw new Error(`当前计算机用户 ${os.userInfo().username} 主目录不存在`)
  }
}

function checkEnv() {
  const envPath = path.join(userHome, '.env')
  if (pathExists.sync(envPath)) {
    dotenv.config({ path: envPath })
  }
  injectDefaultConfig()
}

function injectDefaultConfig() {
  process.env = {
    ...process.env,
    VRN_CLI_DEBUG_ENABLED: 'off',
    VRN_CLI_NAME: CLI_NAME,
    VRN_CLI_PACKAGE_NAME: CLI_PACKAGE_NAME,
    VRN_CLI_VERSION: CLI_VERSION,
    VRN_CLI_HOME_PATH: path.join(userHome, CLI_HOME_NAME),
  }
}

async function checkGlobalUpdate() {
  const spinner = ora('检查版本更新...').start()
  const querier = new NPMQuerier(CLI_PACKAGE_NAME, NPMRegistry.TAOBAO)
  try {
    const latestVersion = await querier.getLatestVersion()
    spinner.stop()
    if (latestVersion && semver.lt(CLI_VERSION, latestVersion)) {
      logger.warn(
        dedent(`
          --------------------------------------------
          发现新版本！
          请手动更新 ${CLI_PACKAGE_NAME}
          当前版本: ${CLI_VERSION}
          最新版本: ${latestVersion}
          更新命令: npm install -g ${CLI_PACKAGE_NAME}
          --------------------------------------------
      `),
      )
    }
  } finally {
    spinner.stop()
  }
}
