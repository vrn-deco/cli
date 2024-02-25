/*
 * @Author: Cphayim
 * @Date: 2021-07-22 09:50:13
 * @Description: check update
 */
import semver from 'semver'

import { type BaseConfig, readConfig, updateConfig } from '@vrn-deco/cli-config-helper'
import { boxen, colors, dedent, logger } from '@vrn-deco/cli-log'
import { queryPackageLatestVersion } from '@vrn-deco/cli-npm-helper'

type CheckUpdateConfig = BaseConfig & {
  // timestamp of last check for updates
  checkUpdateLastTime?: number
}

//time intervall
const INTERVAL = 24 * 60 * 60 * 1000 // 1 day

export async function checkUpdate(): Promise<void> {
  const config = readConfig<CheckUpdateConfig>()

  if (!config.checkUpdateEnabled || !isExpired(INTERVAL, config.checkUpdateLastTime)) return

  const { VRN_CLI_PACKAGE_NAME, VRN_CLI_VERSION } = process.env

  try {
    logger.startLoading('Checking for updates...')
    const latestVersion = await queryPackageLatestVersion(VRN_CLI_PACKAGE_NAME, config.npmRegistry)
    logger.stopLoading()
    if (latestVersion && semver.lt(VRN_CLI_VERSION, latestVersion)) {
      console.log(
        boxen(
          dedent(`
          ${colors.yellow('Discover new version releases!')}
          Please update the main package ${VRN_CLI_PACKAGE_NAME}
          Current version: ${VRN_CLI_VERSION}
          Latest version: ${latestVersion}
          Update command: ${colors.yellow('npm install -g ' + VRN_CLI_PACKAGE_NAME)}
      `),
          { padding: 1, margin: 1, borderColor: 'yellow', dimBorder: true },
        ),
      )
    }
    updateConfig<CheckUpdateConfig>({ checkUpdateLastTime: Date.now() })
  } catch (e) {
    logger.stopLoading()
    logger.error('Check for updates failed!')
  }
}

function isExpired(interval: number, lastTime?: number): boolean {
  if (!lastTime) return true
  return Date.now() > lastTime + interval
}
