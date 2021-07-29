/*
 * @Author: Cphayim
 * @Date: 2021-06-21 01:25:57
 * @Description: npm 安装器
 */
import './type'
import path from 'path'
import npminstall, { PKG } from 'npminstall'

import { DEP_FOLDER, NPMRegistry } from './common'

export type InstallerOptions = {
  /**
   * 基本路径: 默认值 process.cwd()
   */
  baseDir?: string

  /**
   * 依赖安装目录路径: 默认值 baseDir + 'node_modules'
   */
  depDir?: string

  /**
   * 依赖源: 默认值 npm 源
   */
  registry?: string
}

export class NPMInstaller {
  private readonly baseDir: string
  private readonly depDir: string
  private readonly registry: string

  constructor({ baseDir = process.cwd(), depDir, registry = NPMRegistry.NPM }: InstallerOptions = {}) {
    this.baseDir = baseDir
    this.depDir = depDir ?? path.join(baseDir, DEP_FOLDER)
    this.registry = registry
  }

  async install(pkgs: PKG[]): Promise<void> {
    return await npminstall({
      pkgs: pkgs,
      root: this.baseDir,
      storeDir: this.depDir,
      registry: this.registry,
    })
  }
}
