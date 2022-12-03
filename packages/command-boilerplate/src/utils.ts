/*
 * @Author: Cphayim
 * @Date: 2021-07-26 21:14:00
 * @Description:
 */
import path from 'node:path'

import { isString } from '@vrn-deco/cli-shared'

import { CACHE_DIR_NAME } from './common.js'

export function getCacheDirectory(): string {
  return path.resolve(process.env.VRN_CLI_HOME_PATH, CACHE_DIR_NAME)
}

export function isValidProjectName(name: string): boolean {
  const reg = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/
  return isString(name) && reg.test(name)
}

export function isValidVersion(version: string): boolean {
  const reg = /^\d+\.\d+\.\d+/
  return isString(version) && reg.test(version)
}
