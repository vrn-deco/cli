/*
 * @Author: Cphayim
 * @Date: 2022-01-16 23:52:32
 * @Description:
 */
import path from 'path'
import fs from 'fs-extra'

import { isObject } from '@vrn-deco/cli-shared'
import { logger } from '@vrn-deco/cli-log'
import { DistTag } from './common'

export function isPackage(dir: string): boolean {
  const pkg = path.join(dir, 'package.json')
  return fs.pathExistsSync(dir) && fs.existsSync(pkg) && fs.statSync(pkg).isFile()
}

/**
 * 从 VRN_CLI_LOCAL_MAP 环境变量解析本地模块映射
 */
export function parseModuleMap(): Record<string, string> {
  if (!process.env.VRN_CLI_MODULE_MAP) return {} // 没有传递不显示 warning
  let map
  try {
    map = JSON.parse(process.env.VRN_CLI_MODULE_MAP)
  } catch (error) {
    logger.warn(`invalid local_map: ${process.env.VRN_CLI_MODULE_MAP}`)
  }
  return (isObject(map) ? map : {}) as Record<string, string>
}

export function isDistTagVersion(version: string): version is DistTag {
  return version === DistTag.Latest || version === DistTag.Next || version === DistTag.Legacy
}
