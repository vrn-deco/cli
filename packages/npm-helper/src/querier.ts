/*
 * @Author: Cphayim
 * @Date: 2021-06-18 09:48:23
 * @Description: npm 查询器
 */
import axios, { AxiosInstance } from 'axios'
import { DistTag, NPMRegistry } from './common'

type PackageQueryInfo = {
  name: string
  'dist-tags': { [P in DistTag]: string }
}

export class NPMQuerier {
  private readonly fetch: AxiosInstance

  constructor(private readonly name: string, private readonly registry: string = NPMRegistry.NPM) {
    this.name = name
    this.registry = registry
    this.fetch = axios.create({ baseURL: this.registry })
  }

  async getInfo(): Promise<PackageQueryInfo> {
    const { data } = await this.fetch.get<PackageQueryInfo>(`/${this.name}`)
    return data
  }

  async getVersion(tag = DistTag.Latest): Promise<string> {
    const info = await this.getInfo()
    return info['dist-tags'][tag]
  }

  async getLatestVersion(): Promise<string> {
    return this.getVersion(DistTag.Latest)
  }

  async getNextVersion(): Promise<string> {
    return this.getVersion(DistTag.Next)
  }

  async getLegacyVersion(): Promise<string> {
    return this.getVersion(DistTag.Legacy)
  }
}
