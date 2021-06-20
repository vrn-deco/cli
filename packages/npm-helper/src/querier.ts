/*
 * @Author: Cphayim
 * @Date: 2021-06-18 09:48:23
 * @Description: npm 查询器
 */
import axios from 'axios'
import { NPMRegistry } from './common'

type PackageQueryInfo = {
  name: string
  'dist-tags': DistTags
}

type DistTags = {
  latest: string
  next: string
}

export class NPMQuerier {
  private name: string
  private registry: NPMRegistry

  constructor(name: string, registry = NPMRegistry.NPM) {
    this.name = name
    this.registry = registry
  }

  async getInfo(): Promise<PackageQueryInfo> {
    const { data } = await axios.get<PackageQueryInfo>(`${this.registry}/${this.name}`)
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
}
