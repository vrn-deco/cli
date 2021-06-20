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

import { NPMQuerier, NPMRegistry } from '@vrn-deco/npm-helper'
import { figlet, colors, dedent, ora, log } from '@vrn-deco/log'

import { CLI_HOME_NAME, CLI_LOWEST_NODE_VERSION, CLI_NAME } from './constants'
import pkg from '../package.json'

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
  process.stdout.write(colors.green(logo) + '\n\n')
}

function rootDemotion() {
  rootCheck()
}

function checkNodeVersion() {
  const current = process.version
  const lowest = CLI_LOWEST_NODE_VERSION
  if (semver.lt(current, lowest)) {
    throw new Error(
      colors.red(`请更新你的 Node.js 版本 \n最低要求: ${lowest}\n当前版本: ${current}`),
    )
  }
}

function checkUserHome() {
  if (!userHome || !pathExists.sync(userHome)) {
    throw new Error(colors.red(`当前计算机用户 ${os.userInfo().username} 主目录不存在`))
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
  process.env.VRN_CLI_HOME_PATH = path.join(userHome, CLI_HOME_NAME)
}

async function checkGlobalUpdate() {
  const spinner = ora('检查版本更新...').start()
  const name = pkg.name
  const currentVersion = pkg.version
  const querier = new NPMQuerier(name, NPMRegistry.NPM)
  try {
    const latestVersion = await querier.getLatestVersion()
    spinner.stop()
    if (latestVersion && semver.lt(currentVersion, latestVersion)) {
      log.warn(
        '',
        colors.yellow(
          dedent(`
          --------------------------------------------
          发现新版本！
          请手动更新 ${name}
          当前版本: ${currentVersion}
          最新版本: ${latestVersion}
          更新命令: npm install -g ${name}
          --------------------------------------------
      `),
        ),
      )
    }
  } catch (error) {
    spinner.stop()
    throw error
  }
}
