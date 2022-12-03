/*
 * @Author: Cphayim
 * @Date: 2021-06-18 01:28:41
 * @Description: prepare
 */
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import fs from 'fs-extra'
import rootCheck from 'root-check'
import semver from 'semver'

import { checkUpdate } from '@vrn-deco/cli-check-update'
import { figlet, logger } from '@vrn-deco/cli-log'
import { SwitchStatus } from '@vrn-deco/cli-shared'

import { gradient } from './utils.js'

// ESM doesn't have __filename and __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

export function initialEnv() {
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
    LOGGER_LEVEL: debugIndex !== -1 ? 'verbose' : 'info', // pass to the child process
    VRN_CLI_DEBUG_ENABLED: debugIndex !== -1 ? SwitchStatus.On : SwitchStatus.Off,
    VRN_CLI_NAME: 'vrn-cli',
    VRN_CLI_PACKAGE_NAME: pkg.name,
    VRN_CLI_VERSION: pkg.version,
    VRN_CLI_HOME_PATH: path.resolve(userHome, '.vrn-deco'),
    VRN_CLI_LOWEST_NODE_VERSION: pkg['engines']['node'],
    VRN_CLI_MODULE_MAP: '',
  }

  // fix: remove --debug options to prevent commander.js parsing from being misaligned
  debugIndex !== -1 && process.argv.splice(debugIndex, 1)
}

export function printLOGO() {
  logger.clearConsole()
  const logo = figlet.textSync(process.env.VRN_CLI_NAME.toUpperCase(), 'Isometric1')
  console.log(gradient(logo), '\n')
}

export function setLogLevel() {
  if (process.env.VRN_CLI_DEBUG_ENABLED === SwitchStatus.On) {
    logger.setLevel('verbose')
    logger.verbose('enabled debug mode')
    logger.verbose(`System: ${os.type()}`)
    logger.verbose(`Node.js: ${process.version}`)
  } else {
    logger.setLevel('info')
  }
}

export function rootDemotion() {
  if (process.env.SUDO_USER) rootCheck()
}

export function checkNodeVersion() {
  const current = process.version
  const lowest = process.env.VRN_CLI_LOWEST_NODE_VERSION
  if (!semver.satisfies(process.version, lowest)) {
    throw new Error(`Please update your Node.js version\nLowest requirements: ${lowest}\nCurrent version: ${current}`)
  }
}

export function checkUserHome() {
  if (!userHome || !fs.pathExistsSync(userHome)) {
    throw new Error(`The current computer user ${os.userInfo().username} home directory does not exist`)
  }
}
