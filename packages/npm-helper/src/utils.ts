import path from 'path'
import fs from 'fs-extra'

import '@vrn-deco/shared-types'
import { isObject } from '@vrn-deco/shared-utils'
import { logger } from '@vrn-deco/logger'
import { DistTag } from './common'

export function isPackage(dir: string): boolean {
  const pkg = path.join(dir, 'package.json')
  return fs.pathExistsSync(dir) && fs.existsSync(pkg) && fs.statSync(pkg).isFile()
}

// 从环境变量加载本地模块映射
export function parseLocalMapping(): Record<string, string> {
  if (!process.env.VRN_CLI_LOCAL_MAP) return {} // 没有传递不显示 warning
  let map
  try {
    map = JSON.parse(process.env.VRN_CLI_LOCAL_MAP)
  } catch (error) {
    logger.warn(`invalid local_map: ${process.env.VRN_CLI_LOCAL_MAP}`)
  }
  return (isObject(map) ? map : {}) as Record<string, string>
}

export function isDistTagVersion(version: string): version is DistTag {
  return version === DistTag.Latest || version === DistTag.Next || version === DistTag.Legacy
}
