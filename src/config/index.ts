/*
 * @Author: Cphayim
 * @Date: 2020-09-11 15:09:50
 * @LastEditTime: 2020-09-15 10:42:26
 * @Description: 配置文件
 */

import path from 'path'
import { existsSync, writeFileSync, readFileSync } from 'fs'

import YAML from 'yaml'
import { Logger } from '@naughty/logger'

const pkg = require('@/../package')

// 基本信息
export const APP_NAME = 'vrn-cli'
export const PACKAGE_NAME: string = pkg.name
export const PACKAGE_VERSION: string = pkg.version

// 关键路径
/**
 * 项目根路径
 */
export const ROOT_DIR = path.join(__dirname, '..', '..')
/**
 * 当前终端路径
 */
export const PWD_DIR = process.cwd()
/**
 * 用户目录路径
 */
export const USER_HOME_DIR = process.env.HOME || process.env.USERPROFILE

// .vrnconfig 文件
export const VRN_CONFIG_FILE = path.join(USER_HOME_DIR, '.vrnconfig')

export interface VrnConfig {
  registry: string // boilerplate 服务
  npmrepo: string // npm 源
}

const DEFAULT_VRN_CONFIG: VrnConfig = {
  registry: '',
  npmrepo: 'https://registry.npm.taobao.org',
}

export function getVrnConfig(): VrnConfig {
  if (!existsSync(VRN_CONFIG_FILE)) {
    writeFileSync(VRN_CONFIG_FILE, YAML.stringify(DEFAULT_VRN_CONFIG))
  }

  const config = YAML.parse(readFileSync(VRN_CONFIG_FILE).toString())

  if (!config || typeof config !== 'object') {
    Logger.error(`解析 .vrnconfig 文件失败，请检查 ${VRN_CONFIG_FILE}`)
    process.exit(1)
  }
  return config
}

export function setVrnConfig(config: VrnConfig) {
  writeFileSync(VRN_CONFIG_FILE, YAML.stringify(config))
}

// vrn 配置项
export const VRN_CONFIG = getVrnConfig()
