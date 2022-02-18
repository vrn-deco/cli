/*
 * @Author: Cphayim
 * @Date: 2021-06-18 01:28:41
 * @Description: prepare
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
  setLogLevel()
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
  const debugIndex = process.argv.findIndex((arg) => arg === '--debug')
  process.env = {
    ...process.env,
    /**
     * @see [[global.d.ts]]
     */
    VRN_CLI_DEBUG_ENABLED: debugIndex !== -1 ? SwitchStatus.On : SwitchStatus.Off,
    VRN_CLI_NAME: 'vrn-cli',
    VRN_CLI_PACKAGE_NAME: pkg.name,
    VRN_CLI_VERSION: pkg.version,
    VRN_CLI_HOME_PATH: path.resolve(userHome, '.vrn-deco'),
    VRN_CLI_LOWEST_NODE_VERSION:
      semver.valid(pkg?.engines?.node?.match(/(?<version>\d+\.\d+\.\d+)/).groups.version) ?? '12.20.0',
    VRN_CLI_MODULE_MAP: '',
  }

  // fix: remove --debug options to prevent commander.js parsing from being misaligned
  process.argv.splice(debugIndex, debugIndex === -1 ? 0 : 1)
}

function printLOGO() {
  logger.clearConsole()
  const logo = figlet.textSync(process.env.VRN_CLI_NAME.toUpperCase(), '3D Diagonal')
  console.log(colors.green(logo))
}

function setLogLevel() {
  if (process.env.VRN_CLI_DEBUG_ENABLED === SwitchStatus.On) {
    logger.setLevel('verbose')
    logger.verbose('enabled debug mode')
    // passed to the child process
    process.env.LOGGER_LEVEL = 'verbose'
  } else {
    logger.setLevel('info')
  }
}

function rootDemotion() {
  if (process.env.SUDO_USER) rootCheck()
}

function checkNodeVersion() {
  const current = process.version
  const lowest = process.env.VRN_CLI_LOWEST_NODE_VERSION
  if (semver.lt(process.version, lowest)) {
    throw new Error(`Please update your Node.js version\nLowest requirements: ${lowest}\nCurrent version: ${current}`)
  }
}

function checkUserHome() {
  if (!userHome || !fs.pathExistsSync(userHome)) {
    throw new Error(`The current computer user ${os.userInfo().username} home directory does not exist`)
  }
}
