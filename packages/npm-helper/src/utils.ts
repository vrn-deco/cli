/*
 * @Author: Cphayim
 * @Date: 2022-01-16 23:52:32
 * @Description: utils
 */
import path from 'path'
import fs from 'fs-extra'
import os from 'os'
import { execSync } from 'child_process'

import { isObject } from '@vrn-deco/cli-shared'
import { logger } from '@vrn-deco/cli-log'

import { DistTag } from './common'

/**
 * check if dir is a package
 */
export function isPackage(dir: string): boolean {
  const pkg = path.join(dir, 'package.json')
  return fs.pathExistsSync(dir) && fs.existsSync(pkg) && fs.statSync(pkg).isFile()
}

/**
 * parsed module map record from VRN_CLI_MODULE_MAP
 */
export function parseModuleMap(): Record<string, string> {
  let result: Record<string, string> = {}
  if (!process.env.VRN_CLI_MODULE_MAP) return result
  try {
    const parsedMap = JSON.parse(process.env.VRN_CLI_MODULE_MAP) as Record<string, string>
    if (isObject(parsedMap)) {
      result = parsedMap
    }
  } catch (error) {
    logger.warn(`invalid local_map: ${process.env.VRN_CLI_MODULE_MAP}`)
  }
  return result
}

/**
 * check if command is exists
 */
export function cmdExists(cmd: string) {
  try {
    execSync(
      os.platform() === 'win32'
        ? `cmd /c "(help ${cmd} > nul || exit 0) && where ${cmd} > nul 2> nul"`
        : `command -v ${cmd}`,
    )
    return true
  } catch {
    return false
  }
}

/**
 * check if a version is dist tag
 */
export function isDistTagVersion(version: string): version is DistTag {
  return version === DistTag.Latest || version === DistTag.Next || version === DistTag.Legacy
}
