/*
 * @Author: Cphayim
 * @Date: 2021-07-22 09:50:13
 * @Description:
 */
import semver from 'semver'

import { logger, colors, dedent, boxen } from '@vrn-deco/logger'
import { NPMQuerier } from '@vrn-deco/npm-helper'
import { readConfig, updateConfig, BaseConfig } from '@vrn-deco/cli-config'

type CheckUpdateConfig = BaseConfig & {
  // 上一次检查的时间戳
  CheckUpdateLastTime?: number
}

const INTERVAL = 24 * 60 * 60 * 1000 // 1 天

export async function checkUpdate(): Promise<void> {
  const config = readConfig<CheckUpdateConfig>()
  if (config.CheckUpdate === 'off' || !isExpired(INTERVAL, config.CheckUpdateLastTime)) return

  const { VRN_CLI_PACKAGE_NAME, VRN_CLI_VERSION } = process.env

  const querier = new NPMQuerier(VRN_CLI_PACKAGE_NAME, config.NPMRegistry)
  let latestVersion: string
  try {
    logger.startLoading('检查版本更新...')
    latestVersion = await querier.getLatestVersion()
    logger.stopLoading()
    if (latestVersion && semver.lt(VRN_CLI_VERSION, latestVersion)) {
      console.log(
        boxen(
          dedent(`
          ${colors.yellow('发现新版本！')}
          请手动更新 ${VRN_CLI_PACKAGE_NAME}
          当前版本: ${VRN_CLI_VERSION}
          最新版本: ${latestVersion}
          更新命令: ${colors.yellow('npm install -g ' + VRN_CLI_PACKAGE_NAME)}
      `),
          { padding: 1, margin: 1, borderColor: 'yellow', dimBorder: true },
        ),
      )
    }
    updateConfig<CheckUpdateConfig>({ CheckUpdateLastTime: Date.now() })
  } catch (e) {
    logger.stopLoading()
    logger.error('检查更新失败')
  }
}

function isExpired(interval: number, lastTime?: number): boolean {
  if (!lastTime) return true
  return Date.now() > lastTime + interval
}
