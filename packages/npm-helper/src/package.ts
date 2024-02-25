/*
 * @Author: Cphayim
 * @Date: 2021-07-27 15:31:50
 * @Description: package manager
 */
import path from 'node:path'

import { execa } from 'execa'
import fs from 'fs-extra'

import { logger } from '@vrn-deco/cli-log'
import { NPMRegistry, PackageManager } from '@vrn-deco/cli-shared'

import { DistTag } from './common.js'
import { type InstallOptions, installPackage } from './install.js'
import { queryPackageVersion } from './querier.js'
import { isDistTagVersion, isPackage, parseModuleMap } from './utils.js'

type PackageOptions = InstallOptions & {
  //
}

/**
 * Default:
 * install modules via npm registry
 * - if an exact version number is specified
 *   - find the module in baseDir, install it if not found
 * - if a dist tag is specified
 *   - query the exact version corresponding to the dist tag
 *   - find the module in baseDir, install it if not found
 *
 * Local:
 * use the specified local module
 */
enum Mode {
  Default,
  Local,
}

export class NPMPackage {
  private loaded = false

  /**
   * mode
   */
  private mode: Mode = Mode.Default

  /**
   * package name
   */
  private name: string

  /**
   * package version or dist tag
   */
  private versionOrDistTag: string

  /**
   * base directory
   *
   * if the module is not installed, install it to `${baseDir}/node_modules/${name}`
   */
  private baseDir: string

  /**
   * npm registry
   */
  private registry: string

  /**
   * package manager
   */
  private packageManager: PackageManager

  /**
   * local modules mapping
   */
  private localMap: Record<string, string>

  constructor(options: PackageOptions) {
    this.name = options.name
    this.versionOrDistTag = options.versionOrDistTag ?? DistTag.Latest
    this.baseDir = options.baseDir ?? process.cwd()
    this.registry = options.registry ?? NPMRegistry.NPM
    this.packageManager = options.packageManager ?? PackageManager.NPM

    this.localMap = parseModuleMap()
    if (this.localMap[this.name]) {
      this.mode = Mode.Local
    }
  }

  /**
   * package directory absolute path
   */
  get packageDir(): string {
    this.requireLoaded()
    return this.mode === Mode.Local ? this.localMap[this.name] : this.cachePackageDir
  }

  private get cachePackageDir() {
    return path.join(this.baseDir, 'node_modules', this.name)
  }

  /**
   * package.json parse object
   */
  get packageJSON(): Record<string, string> {
    return fs.readJsonSync(path.join(this.packageDir, 'package.json'))
  }

  /**
   * package.json main field absolute path
   */
  get mainScript(): string {
    const pkg = this.packageJSON
    if (pkg && pkg['main']) {
      return path.join(this.packageDir, pkg['main'])
    } else {
      throw new Error(`${this.name} package.main field not exists`)
    }
  }

  /**
   * load package
   *
   * must be called after create instance, it will inspect and install modules based on mode rules.
   */
  async load(): Promise<this> {
    if (this.loaded) return this

    logger.verbose(`init package: ${this.name}@${this.versionOrDistTag}`)
    if (this.mode === Mode.Local) {
      await this.loadLocal()
    } else {
      await this.loadExternal()
    }
    this.loaded = true
    return this
  }

  /**
   * load external package
   *
   * check package on local cache. if not found, install it
   */
  private async loadExternal() {
    logger.verbose(`init external package...`)
    if (!fs.pathExistsSync(this.baseDir)) {
      fs.mkdirpSync(this.baseDir)
    }
    await this.standardizeVersion()
    await this.installOrUpdate()
  }

  /**
   * load local package
   */
  private async loadLocal() {
    logger.verbose(`init local package...`)
    if (!isPackage(this.localMap[this.name])) {
      throw new Error(`path ${this.localMap[this.name]} is not a package`)
    }
  }

  /**
   * standardize version
   *
   * if version is a dist tag, query the corresponding version.
   * it is a preparation to load external modules and should be used when Mode.Default.
   */
  private async standardizeVersion() {
    const spinner = logger.createSpinner(`inspect package ${this.name} ...`)
    try {
      // 当传递的 version 是个 tag 时，获取对应的版本号替换 version
      if (isDistTagVersion(this.versionOrDistTag)) {
        const version = await queryPackageVersion(this.name, this.versionOrDistTag, this.registry)
        if (!version) throw new Error(`${this.name}@${this.versionOrDistTag} not found at ${this.registry}`)
        this.versionOrDistTag = version
      }
    } finally {
      spinner.stop()
    }
  }

  /**
   * install or update package
   */
  private async installOrUpdate() {
    // here the unified use of `npm list`
    const { stdout } = await execa(PackageManager.NPM, ['list', '--depth=0', '--json'], { cwd: this.baseDir })
    const result = JSON.parse(stdout)
    const installed =
      result.dependencies?.[this.name] && result.dependencies[this.name].version === this.versionOrDistTag
    if (installed) return

    const spinner = logger.createSpinner(`install package ${this.name}@${this.versionOrDistTag} ...`)
    try {
      await installPackage({
        name: this.name,
        versionOrDistTag: this.versionOrDistTag,
        baseDir: this.baseDir,
        registry: this.registry,
        packageManager: this.packageManager,
      })
    } finally {
      spinner.stop()
    }
  }

  private requireLoaded() {
    if (!this.loaded) throw new Error(`please call and await the \`load\` is complete`)
  }
}
