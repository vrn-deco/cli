/*
 * @Author: Cphayim
 * @Date: 2021-07-27 23:48:59
 * @Description:
 */
import { Manifest } from '@vrn-deco/boilerplate-protocol'
import { DistTag, NPMPackage } from '@vrn-deco/cli-npm-helper'
import { readConfig } from '@vrn-deco/cli-config-helper'
import { getCacheDirectory } from '../utils'

const BOILERPLATE_MANIFEST_PACKAGE = '@vrn-deco/boilerplate-manifest'

export class BoilerplateService {
  private static instance: BoilerplateService

  private constructor() {
    BoilerplateService.instance = this
  }

  static getInstance() {
    if (BoilerplateService.instance) return BoilerplateService.instance
    return new BoilerplateService()
  }

  private config = readConfig()
  private manifest: Manifest | null = null

  async loadManifest(refresh = false): Promise<Manifest> {
    if (!refresh && this.manifest) return this.manifest
    const pkg = await this.createPackage(BOILERPLATE_MANIFEST_PACKAGE, DistTag.Latest)
    this.manifest = (await import(pkg.mainScript)).getManifest() as Manifest

    return this.manifest
  }

  async loadBoilerplate(name: string, versionOrDistTag: string) {
    const pkg = await this.createPackage(name, versionOrDistTag)
    return pkg
  }

  private async createPackage(name: string, versionOrDistTag: string) {
    return new NPMPackage({
      name,
      versionOrDistTag,
      baseDir: getCacheDirectory(),
      registry: this.config.npmRegistry,
      packageManager: this.config.packageManager,
    }).load()
  }
}
