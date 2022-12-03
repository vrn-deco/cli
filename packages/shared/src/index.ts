/*
 * @Author: Cphayim
 * @Date: 2021-06-26 01:20:21
 * @Description: shared utils
 */
import { execSync } from 'node:child_process'
import os from 'node:os'
import { pathToFileURL } from 'node:url'

export * as testShared from './test-shared.js'

export * from './type-helper.js'
export * from './enum.js'

export const noop = function () {
  //
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
      { stdio: 'ignore' },
    )
    return true
  } catch {
    return false
  }
}

/**
 * ESM dynamic import compatible with Windows
 * Only file and data URLs are supported by the default ESM loader. On Windows, absolute paths must be valid file:// URLs.
 */
export async function dynamicImport(path: string) {
  return import(pathToFileURL(path).href)
}
