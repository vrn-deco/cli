/*
 * @Author: Cphayim
 * @Date: 2020-09-12 23:44:04
 * @LastEditTime: 2021-04-01 15:44:39
 * @Description:
 */
import { join } from 'path'
import { createWriteStream } from 'fs'

import { fetch } from '@/utils/fetch'
import { VrnConfig } from '@/models/vrn-config'
import { Resource } from '@/models/resource'
import ConfigService from './config.service'

export default class ResourceService {
  private config: VrnConfig

  constructor() {
    this.config = new ConfigService().getAll()
  }

  /**
   * 获取 resource.json
   * @param cache
   */
  async fetchResource(cache = true): Promise<any> {
    const params = cache ? {} : { t: ~~(Date.now() / 1000) }
    const response = await fetch.get<Resource>('resource.json', {
      baseURL: this.config.registry,
      params,
    })
    return response.data
  }

  /**
   * 下载样板
   * @param url
   * @param saveDir
   * @param cache
   */
  async downloadBoilerplate(url: string, saveDir: string, cache: boolean = true): Promise<any> {
    const params = cache ? {} : { t: ~~(Date.now() / 1000) }
    const response = await fetch.get(url, {
      baseURL: this.config.registry,
      params,
      responseType: 'stream',
    })
    response.data.pipe(createWriteStream(join(saveDir, url)))

    return new Promise((resolve, reject) => {
      response.data.on('end', () => {
        // 加 1 秒延迟，防止文件流未关闭前执行后续的操作
        setTimeout(resolve, 1000)
      })

      response.data.on('error', () => {
        reject()
      })
    })
  }
}
