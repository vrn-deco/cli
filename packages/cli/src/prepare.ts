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
import userHome from 'user-home'

import { figlet, colors, dedent, logger } from '@vrn-deco/logger'
import { NPMQuerier, NPMRegistry } from '@vrn-deco/npm-helper'
import { readConfig, updateConfig } from '@vrn-deco/cli-config'

const pkg = fs.readJsonSync(path.resolve(__dirname, '..', 'package.json'))

export async function prepare(): Promise<void> {
  initialEnv()
  printLOGO()
  rootDemotion()
  checkNodeVersion()
  checkUserHome()
  await checkGlobalUpdate()
}

function initialEnv() {
  const envPath = path.join(userHome, '.env')
  if (fs.existsSync(envPath) && fs.statSync(envPath).isFile()) dotenv.config({ path: envPath })
  injectDefaultEnv()
}

function injectDefaultEnv() {
  process.env = {
    ...process.env,
    VRN_CLI_DEBUG_ENABLED: 'off',
    VRN_CLI_NAME: 'vrn-cli',
    VRN_CLI_PACKAGE_NAME: pkg.name,
    VRN_CLI_VERSION: pkg.version,
    VRN_CLI_HOME_PATH: path.resolve(userHome, '.vrn-cli'),
    VRN_CLI_LOWEST_NODE_VERSION: 'v12.0.0',
  }
}

function printLOGO() {
  const logo = figlet.textSync(process.env.VRN_CLI_NAME.toUpperCase(), '3D Diagonal')
  console.log(colors.green(logo))
}

function rootDemotion() {
  rootCheck()
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

// 检查更新
async function checkGlobalUpdate() {
  const config = readConfig()
  if (config.CheckUpdate === 'off' || !isExpired(config.CheckUpdateInterval, config.CheckUpdateLastTime)) return

  const { VRN_CLI_PACKAGE_NAME, VRN_CLI_VERSION } = process.env

  const querier = new NPMQuerier(VRN_CLI_PACKAGE_NAME, NPMRegistry.NPM)
  let latestVersion: string
  try {
    logger.startLoading('检查版本更新...')
    latestVersion = await querier.getLatestVersion()
  } finally {
    logger.stopLoading()
  }

  if (latestVersion && semver.lt(VRN_CLI_VERSION, latestVersion)) {
    logger.warn(
      dedent(`
        --------------------------------------------
        发现新版本！
        请手动更新 ${VRN_CLI_PACKAGE_NAME}
        当前版本: ${VRN_CLI_VERSION}
        最新版本: ${latestVersion}
        更新命令: npm install -g ${VRN_CLI_PACKAGE_NAME}
        --------------------------------------------
    `),
    )
  }
  updateConfig({ CheckUpdateLastTime: Date.now() })
}

function isExpired(interval: number, lastTime?: number): boolean {
  if (!lastTime) return true
  return Date.now() > lastTime + interval
}
