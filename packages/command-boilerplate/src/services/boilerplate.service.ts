/*
 * @Author: Cphayim
 * @Date: 2021-07-27 23:48:59
 * @Description:
 */
import path from 'node:path'
import { pipeline as _pipeline } from 'node:stream'
import { promisify } from 'node:util'

import fs from 'fs-extra'
import fetch from 'node-fetch'

import type { APIManifest, Manifest } from '@vrn-deco/boilerplate-protocol'
import { readConfig } from '@vrn-deco/cli-config-helper'
import { logger } from '@vrn-deco/cli-log'
import { DistTag, NPMPackage } from '@vrn-deco/cli-npm-helper'
import { dynamicImport } from '@vrn-deco/cli-shared'

import { DEFAULT_API_BASE_URL, DEFAULT_MANIFEST_PACKAGE } from '../common.js'
import { getCacheDirectory } from '../utils.js'

const pipeline = promisify(_pipeline)

export interface IBoilerplateProvider {
  loadManifest(refresh?: boolean): Promise<Manifest | APIManifest>
}

export class PackageBoilerplateService implements IBoilerplateProvider {
  private config = readConfig()
  private manifestPackage: string
  private manifest: Manifest | null = null

  constructor(manifestPackage = DEFAULT_MANIFEST_PACKAGE) {
    this.manifestPackage = manifestPackage
  }

  async loadManifest(refresh = false): Promise<Manifest> {
    if (!refresh && this.manifest) return this.manifest
    const pkg = await this.createPackage(this.manifestPackage, DistTag.Latest)
    this.manifest = (await dynamicImport(pkg.mainScript)).getManifest() as Manifest
    return this.manifest
  }

  async loadBoilerplate(packageName: string, versionOrDistTag?: string) {
    return this.createPackage(packageName, versionOrDistTag)
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

export class HTTPBoilerplateService implements IBoilerplateProvider {
  private apiUrl: string
  private manifest: APIManifest | null = null

  constructor(apiUrl = DEFAULT_API_BASE_URL) {
    this.apiUrl = apiUrl
  }

  async loadManifest(refresh?: boolean): Promise<APIManifest> {
    if (!refresh && this.manifest) return this.manifest
    try {
      logger.startLoading('fetching boilerplate manifest...')
      this.manifest = await this.fetchManifest()
      return this.manifest
    } catch (error) {
      logger.verbose(error)
      throw new Error(`Failed to fetch boilerplate manifest: ${this.apiUrl}/manifest.json`)
    } finally {
      logger.stopLoading()
    }
  }

  async downloadBoilerplate(file: string, dir: string): Promise<string> {
    const saveName = path.basename(file)
    try {
      logger.startLoading(`downloading boilerplate ${saveName}...`)
      const stream = await this.fetchBoilerplate(file)
      if (!stream) throw new Error('Failed to fetch boilerplate stream')
      // write stream
      await pipeline(stream, fs.createWriteStream(path.join(dir, saveName)))
      return saveName
    } catch (error) {
      logger.verbose(error)
      throw new Error(`Failed to download boilerplate: ${file}`)
    } finally {
      logger.stopLoading()
    }
  }

  private async fetchManifest(): Promise<APIManifest> {
    const response = await fetch(`${this.apiUrl}/manifest.json`)
    const data = (await response.json()) as APIManifest
    return data
  }

  private async fetchBoilerplate(file: string): Promise<NodeJS.ReadableStream | null> {
    const url = /^https?:\/\//.test(file) ? file : `${this.apiUrl}/${file}`
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/octet-stream' },
    })
    if (!response.ok) {
      throw new Error(`unexpected response ${response.statusText}`)
    }
    return response.body
  }
}
