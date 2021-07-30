/*
 * @Author: Cphayim
 * @Date: 2021-07-27 15:31:50
 * @Description: 包管理
 */
import path from 'path'
import fs from 'fs-extra'
import { logger } from '@vrn-deco/logger'

import { DEP_FOLDER, DistTag, NPMRegistry } from './common'
import { parseLocalMapping, isPackage, isDistTagVersion } from './utils'
import { NPMQuerier } from './querier'
import { InstallerOptions, NPMInstaller } from './installer'

type PackageOptions = Omit<InstallerOptions, 'depDir'> & {
  /**
   * 依赖目录: 默认值 'node_modules'
   */
  depFolder?: string
}

const enum Mode {
  Default,
  Local,
}

/**
 * 默认模式:
 * 模块通过 npm 源获取
 * 如果指定准确版本号，查找本地 cache 中是否存在模块，如果不存在进行下载
 * 如果指定 tag，查找 tag 对应的最新版本号模块在本地 cache 中是否存在，如果不存在进行下载
 *
 * 本地模式:
 * 模块在本地，忽略下载和更新检查
 */
export class NPMPackage {
  loaded = false

  // 模式
  mode = Mode.Default
  // 基本目录
  readonly baseDir: string
  // 依赖安装目录
  readonly depDir: string
  // npm 源
  readonly registry: string
  // 本地模块映射
  readonly localMap: Record<string, string>

  /**
   * 包所在目录
   */
  packageDir!: string

  constructor(
    // 包名
    private readonly name: string,
    // 版本号
    private version: DistTag | string,
    { baseDir = process.cwd(), depFolder = DEP_FOLDER, registry = NPMRegistry.NPM }: PackageOptions = {},
  ) {
    this.baseDir = baseDir
    this.depDir = path.resolve(baseDir, depFolder)

    this.registry = registry

    this.localMap = parseLocalMapping()
    // 包存在本地映射时使用本地模式
    if (this.localMap[this.name]) {
      this.mode = Mode.Local
    }
  }

  /**
   * 获取包路径
   */
  getDir(): string {
    this.requireLoaded()
    return this.packageDir
  }

  /**
   * 获取 package.json 的解析对象
   */
  getPackageJSON(): Record<string, string> {
    return fs.readJsonSync(path.join(this.getDir(), 'package.json'))
  }

  /**
   * 获取入口脚本路径
   */
  getMainScriptPath(): string {
    const dir = this.getDir()
    const pkgjson = this.getPackageJSON()
    if (pkgjson && pkgjson.main) {
      return path.join(dir, pkgjson.main)
    } else {
      throw new Error(`${this.name} package.main field not exists`)
    }
  }

  /**
   * 加载 package
   */
  async load(): Promise<this> {
    logger.verbose(`init package: ${this.name}@${this.version}`)
    if (this.mode === Mode.Local) {
      await this.loadLocal()
    } else {
      await this.loadExternal()
    }
    this.loaded = true
    return this
  }

  /**
   * 装载外部模块
   */
  private async loadExternal() {
    logger.verbose(`init external package...`)

    await this.standardizeVersion()
    this.packageDir = await this.installOrUpdate()
  }

  /**
   * 装载本地模块
   */
  private async loadLocal() {
    logger.verbose(`init local package...`)
    const packageDir = this.localMap[this.name]

    if (!isPackage(packageDir)) throw new Error(`path ${packageDir} is not a package`)
    this.packageDir = packageDir
  }

  /**
   * 标准化版本号
   */
  private async standardizeVersion() {
    const spinner = logger.createSpinner(`inspect package ${this.name} ...`)
    try {
      // 当传递的 version 是个 tag 时，获取对应的版本号替换 version
      if (isDistTagVersion(this.version)) {
        const version = await new NPMQuerier(this.name, this.registry).getVersion(this.version)
        if (!version) throw new Error(`${this.name}@${this.version} not found at ${this.registry}`)
        this.version = version
      }
    } finally {
      spinner.stop()
    }
  }

  /**
   * 安装或更新
   */
  private async installOrUpdate() {
    if (!fs.pathExistsSync(this.depDir)) {
      fs.mkdirpSync(this.depDir)
    }
    // 检查包是否存在缓存，不存在则安装
    const packageDir = this.getSpecificCacheFilePath()
    if (!fs.pathExistsSync(packageDir)) {
      const spinner = logger.createSpinner(`install package ${this.name}@${this.version} ...`)
      try {
        await new NPMInstaller({ baseDir: this.baseDir, depDir: this.depDir, registry: this.registry }).install(
          [{ name: this.name, version: this.version }],
          true,
        )
      } finally {
        spinner.stop()
      }
    }
    return packageDir
  }

  private requireLoaded(): void {
    if (!this.loaded) throw new Error(`Please call or await the \`load\` is complete`)
  }

  private getSpecificCacheFilePath(): string {
    // @vrn-deco/cli 1.1.2 -> _@vrn-deco_cli@1.1.2@@vrn-deco/cli
    const prefix = this.name.replace(/\//g, '_')
    return path.resolve(this.depDir, `_${prefix}@${this.version}@${this.name}`)
  }
}
