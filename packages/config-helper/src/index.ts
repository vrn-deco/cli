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
import path from 'node:path'
import crypto from 'node:crypto'
import fs from 'fs-extra'

type Option = {
  readonly name: string
  readonly value: string
}

export const enum PackageManager {
  NPM = 'npm',
  Yarn = 'yarn',
  PNPM = 'pnpm',
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
  npmRegistry: string
  /**
   * 包管理器
   */
  packageManager: PackageManager
  /**
   * 检查更新开关
   */
  checkUpdateEnabled: boolean
}

export const npmRegistryOptions: Option[] = [
  { name: 'npm', value: `https://registry.npmjs.org/` },
  { name: 'taobao', value: `https://registry.npm.taobao.org/` },
]
export const packageManagerOptions: Option[] = [
  { name: PackageManager.NPM, value: PackageManager.NPM },
  { name: PackageManager.Yarn, value: PackageManager.Yarn },
  { name: PackageManager.PNPM, value: PackageManager.PNPM },
]

// 默认的配置和选项
const defaultBaseConfig: BaseConfig = {
  npmRegistry: npmRegistryOptions[1].value,
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
    throw new Error('configuration initialization must be after environment variables initialization')
  }
  fs.mkdirpSync(VRN_CLI_HOME_PATH)
  configPath = path.resolve(VRN_CLI_HOME_PATH, 'vrn-cli.config')
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
