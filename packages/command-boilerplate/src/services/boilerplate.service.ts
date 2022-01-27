/*
 * @Author: Cphayim
 * @Date: 2021-07-27 23:48:59
 * @Description:
 */
import { Manifest } from '@vrn-deco/protocol-boilerplate'
import { DistTag, NPMPackage } from '@vrn-deco/cli-npm-helper'
import { readConfig } from '@vrn-deco/cli-config-helper'
import { getCacheDirectory } from '../utils'

const BOILERPLATE_MANIFEST_PACKAGE = '@vrn-deco/boilerplate-manifest'

export class BoilerplateService {
  private config = readConfig()
  private manifest: Manifest | null = null

  async getManifest(refresh = false): Promise<Manifest> {
    if (!refresh && this.manifest) return this.manifest

    const pkg = await new NPMPackage(BOILERPLATE_MANIFEST_PACKAGE, DistTag.Latest, {
      baseDir: getCacheDirectory(),
      depFolder: 'boilerplate',
      registry: this.config.npmRegistry,
    }).load()
    this.manifest = require(pkg.getMainScriptPath()).getManifest() as Manifest

    return this.manifest
  }
}
