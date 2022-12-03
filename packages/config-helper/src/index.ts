/*
 * @Author: Cphayim
 * @Date: 2021-06-22 00:27:10
 * @Description: config file manager
 *
 * Please only use this package to read and write `vrn-cli.config` files
 * 请仅使用此包读写 `vrn-cli.config` 文件
 *
 * configure priority
 * profile > default
 * 配置优先级
 * 配置文件 > 默认值
 *
 * configuration includes: global configuration, service configuration (such as boilerplate service)
 * only include configuration items that need to be written to disk, otherwise use environment variables
 * 配置包含：全局通用配置、服务配置（如 boilerplate 服务）
 * 仅包含需要写入磁盘的配置项，否则请使用环境变量
 */
import crypto from 'node:crypto'
import path from 'node:path'

import fs from 'fs-extra'

import { NPMRegistry, PackageManager } from '@vrn-deco/cli-shared'

type ConfigWrapper<T extends BaseConfig> = {
  packageVersion: string
  modifiedTime: number
  signature: string
  config: T
}

export type BaseConfig = {
  npmRegistry: string
  packageManager: PackageManager
  checkUpdateEnabled: boolean
}

const CLI_CONFIG_FILE_NAME = '.clirc'

const defaultBaseConfig: BaseConfig = {
  // by default, taobao registry is used for easy access in China
  npmRegistry: NPMRegistry.TAOBAO,
  packageManager: PackageManager.NPM,
  checkUpdateEnabled: true,
}

let initialized = false
let configPath: string

function initialize() {
  if (initialized) return
  checkCLIHomePath()
  initialized = true
}

function checkCLIHomePath() {
  const { VRN_CLI_HOME_PATH } = process.env
  if (!VRN_CLI_HOME_PATH) {
    throw new Error('configuration initialization must be after environment variables initialization.')
  }
  fs.mkdirpSync(VRN_CLI_HOME_PATH)
  configPath = path.resolve(VRN_CLI_HOME_PATH, CLI_CONFIG_FILE_NAME)
}

export function readConfig<T extends BaseConfig>(): T {
  initialize()
  if (fs.existsSync(configPath) && fs.statSync(configPath).isFile()) {
    const wrapper = fs.readJsonSync(configPath) as ConfigWrapper<T>
    return { ...defaultBaseConfig, ...wrapper.config }
  } else {
    return defaultBaseConfig as unknown as T
  }
}

export function writeConfig<T extends BaseConfig>(config: T): void {
  const wrapper: ConfigWrapper<T> = {
    packageVersion: process.env.VRN_CLI_VERSION,
    modifiedTime: Date.now(),
    signature: getSignature(config, process.env.VRN_CLI_VERSION),
    config,
  }
  fs.writeJsonSync(configPath, wrapper, { spaces: 2 })
}

export function updateConfig<T extends BaseConfig>(configPartial: Partial<T>): void {
  const oldConfig = readConfig<T>()
  const merged = { ...defaultBaseConfig, ...oldConfig, ...configPartial }
  writeConfig(merged)
}

function getSignature(data: unknown, extra: string | number): string {
  const dataStr = JSON.stringify(data)
  return crypto.createHash('sha256').update(`${dataStr}.${extra}`).digest('hex')
}
