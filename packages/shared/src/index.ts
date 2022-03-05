/*
 * @Author: Cphayim
 * @Date: 2021-06-26 01:20:21
 * @Description: shared utils
 */
import os from 'node:os'
import { execSync } from 'node:child_process'

export * as testShared from './test-shared.js'

export * from './type-helper.js'
export * from './enum.js'

export const noop = (): void => void 0

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
