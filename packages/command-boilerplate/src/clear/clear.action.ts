/*
 * @Author: Cphayim
 * @Date: 2022-05-16 11:25:16
 * @Description: boilerplate clear command action
 */
import fs from 'fs-extra'

import { Action, type ActionArgs } from '@vrn-deco/cli-command'
import { logger } from '@vrn-deco/cli-log'

import { getCacheDirectory } from '../utils.js'

type ClearArguments = []
type ClearOptions = {
  //
}

export type ClearActionArgs = ActionArgs<ClearArguments, ClearOptions>

export class ClearAction extends Action<ClearArguments, ClearOptions> {
  cacheDir = getCacheDirectory()

  async initialize(): Promise<void> {
    //
  }

  async execute(): Promise<void> {
    await this.clearCache()
    logger.done('Successfully cleared boilerplate package dependency cache.')
  }

  async clear(): Promise<void> {
    //
  }

  async clearCache() {
    if (fs.existsSync(this.cacheDir)) {
      logger.verbose(`clear ${this.cacheDir}}`)
      fs.removeSync(this.cacheDir)
    }
  }
}
