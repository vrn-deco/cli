/*
 * @Author: Cphayim
 * @Date: 2021-06-22 00:27:10
 * @Description: 配置管理器
 */
/**
 * 请仅使用此包读写 vrn-cli.config 文件
 *
 * 配置优先级
 * 配置文件 > 默认值
 *
 * 配置包含：全局通用配置、服务配置（如 boilerplate 服务）
 * 仅包含需要写入磁盘的配置项，否则请使用环境变量
 */

import fs from 'fs-extra'
import crypto from 'crypto'

import '@vrn-deco/shared-types'
import path from 'path'

type Option = {
  readonly name: string
  readonly value: string
}

export enum NPMClient {
  NPM = 'npm',
  Yarn = 'yarn',
}

type ConfigWrapper<T extends BaseConfig> = {
  packageVersion: string
  modifiedTime: number
  signature: string
  config: T
}

export type BaseConfig = {
  /**
   * npm 源
   */
  NPMRegistry: string
  /**
   * npm 客户端
   */
  NPMClient: 'npm' | 'yarn'
  /**
   * 检查更新开关
   */
  CheckUpdate: 'on' | 'off'
}

export type BaseConfigWithOptions = BaseConfig & {
  NPMRegistryOptions: Option[]
  NPMClientOptions: Option[]
}

const npmRegistryOptions: Option[] = [
  { name: 'npm', value: `https://registry.npmjs.org/` },
  { name: 'taobao', value: `https://registry.npm.taobao.org/` },
]
const npmCLientOptions: Option[] = [
  { name: NPMClient.NPM, value: NPMClient.NPM },
  { name: NPMClient.Yarn, value: NPMClient.Yarn },
]

const defaultBaseConfigWithOptions: BaseConfigWithOptions = {
  NPMRegistry: npmRegistryOptions[1].value,
  NPMClient: NPMClient.NPM,
  NPMRegistryOptions: npmRegistryOptions,
  NPMClientOptions: npmCLientOptions,
  CheckUpdate: 'on',
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
    throw new Error('configuration initialization must be after environment variables initialization')
  }
  fs.mkdirpSync(VRN_CLI_HOME_PATH)
  configPath = path.resolve(VRN_CLI_HOME_PATH, 'vrn-cli.config')
}

export function readConfig<T extends BaseConfig>(): T {
  initialize()
  if (fs.existsSync(configPath) && fs.statSync(configPath).isFile()) {
    const wrapper = fs.readJsonSync(configPath) as ConfigWrapper<T>
    return { ...defaultBaseConfigWithOptions, ...wrapper.config }
  } else {
    return defaultBaseConfigWithOptions as unknown as T
  }
}

export function writeConfig<T extends BaseConfig>(config: T): void {
  const packageVersion = process.env.VRN_CLI_VERSION
  const modifiedTime = Date.now()
  const signature = getSignature(config, packageVersion)

  const wrapper: ConfigWrapper<T> = {
    packageVersion,
    modifiedTime,
    signature,
    config,
  }
  fs.writeJsonSync(configPath, wrapper, { spaces: 2 })
}

export function updateConfig<T extends BaseConfig>(configPartial: Partial<T>): void {
  const oldConfig = readConfig<T>()
  const merged = { ...defaultBaseConfigWithOptions, ...oldConfig, ...configPartial }
  writeConfig(merged)
}

function getSignature(data: unknown, extra: string | number): string {
  const dataStr = JSON.stringify(data)
  return crypto.createHash('sha256').update(`${dataStr}.${extra}`).digest('hex')
}
