/*
 * @Author: Cphayim
 * @Date: 2020-09-12 23:44:04
 * @LastEditTime: 2020-09-13 01:14:43
 * @Description:
 */
import { join } from 'path'
import { createWriteStream } from 'fs'

import { Category } from '@/models/boilerplate'
import { fetch } from './fetch'

export default class BoilerplateService {
  /**
   * 获取样板配置
   * @param cache
   */
  async fetchBoilerplateConfig(cache = true): Promise<any> {
    const params = cache ? {} : { t: ~~(Date.now() / 1000) }
    const response = await fetch.get<Category[]>('boilerplate.json', { params })
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
    const response = await fetch.get(url, { params, responseType: 'stream' })
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
