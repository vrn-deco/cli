/*
 * @Author: Cphayim
 * @Date: 2021-07-27 23:48:59
 * @Description:
 */
import { Manifest } from '@vrn-deco/boilerplate-protocol'
import { DistTag, NPMPackage } from '@vrn-deco/cli-npm-helper'
import { readConfig } from '@vrn-deco/cli-config-helper'

import { getCacheDirectory } from '../utils.js'
import { DEFAULT_MANIFEST_PACKAGE } from '../common.js'

export interface BoilerplateProvider {
  loadManifest(refresh?: boolean): Promise<Manifest>
  loadBoilerplate(name: string): Promise<unknown>
}

export class PackageBoilerplateService implements BoilerplateProvider {
  private config = readConfig()
  private manifestPackage: string
  private manifest: Manifest | null = null

  constructor(manifestPackage = DEFAULT_MANIFEST_PACKAGE) {
    this.manifestPackage = manifestPackage
  }

  async loadManifest(refresh = false): Promise<Manifest> {
    if (!refresh && this.manifest) return this.manifest
    const pkg = await this.createPackage(this.manifestPackage, DistTag.Latest)
    this.manifest = (await import(pkg.mainScript)).getManifest() as Manifest
    return this.manifest
  }

  async loadBoilerplate(name: string, versionOrDistTag?: string) {
    return this.createPackage(name, versionOrDistTag)
  }

  private async createPackage(name: string, versionOrDistTag?: string) {
    return new NPMPackage({
      name,
      versionOrDistTag,
      baseDir: getCacheDirectory(),
      registry: this.config.npmRegistry,
      packageManager: this.config.packageManager,
    }).load()
  }
}
