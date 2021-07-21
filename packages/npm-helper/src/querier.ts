/*
 * @Author: Cphayim
 * @Date: 2021-06-18 09:48:23
 * @Description: npm 查询器
 */
import axios, { AxiosInstance } from 'axios'
import { NPMRegistry } from './common'

type PackageQueryInfo = {
  name: string
  'dist-tags': DistTags
}

type DistTags = {
  latest: string
  next: string
  legacy: string
}

export class NPMQuerier {
  private name: string
  private registry: string
  private fetch: AxiosInstance

  constructor(name: string, registry: string = NPMRegistry.NPM) {
    this.name = name
    this.registry = registry
    this.fetch = axios.create({ baseURL: this.registry })
  }

  async getInfo(): Promise<PackageQueryInfo> {
    const { data } = await this.fetch.get<PackageQueryInfo>(`/${this.name}`)
    return data
  }

  async getLatestVersion(): Promise<string> {
    const info = await this.getInfo()
    return info['dist-tags'].latest
  }

  async getNextVersion(): Promise<string> {
    const info = await this.getInfo()
    return info['dist-tags'].next
  }

  async getLegacyVersion(): Promise<string> {
    const info = await this.getInfo()
    return info['dist-tags'].legacy
  }
}
