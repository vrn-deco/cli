/*
 * @Author: Cphayim
 * @Date: 2020-10-03 02:02:42
 * @LastEditTime: 2020-10-09 14:31:32
 * @Description: 命令行配置存取服务
 */
import { existsSync, readFileSync, statSync, writeFileSync } from 'fs'

import YAML from 'yaml'
import { Logger } from '@naughty/logger'

import { VRN_CONFIG_FILE } from '@/constants'
import { VrnConfig } from '@/models/vrn-config'

export default class ConfigService {
  DEFAULT_VRN_CONFIG: VrnConfig = {
    registry: '',
    npmrepo: 'https://registry.npm.taobao.org',
  }

  // 处理获取
  getAll(key: string = ''): VrnConfig {
    // 如果 .vrnconfig 文件不存在，创建一个
    if (!existsSync(VRN_CONFIG_FILE) || !statSync(VRN_CONFIG_FILE).isFile()) {
      writeFileSync(VRN_CONFIG_FILE, YAML.stringify(this.DEFAULT_VRN_CONFIG))
    }

    const config = YAML.parse(readFileSync(VRN_CONFIG_FILE).toString())

    if (!config || typeof config !== 'object') {
      Logger.error(`解析 .vrnconfig 文件失败，请检查 ${VRN_CONFIG_FILE}`)
      process.exit(1)
    }
    return config
  }

  // 处理设置
  set(key: string, value: string): void {
    if (!key || !value) throw new Error('key 和 value 参数是必要的')

    const config: VrnConfig = this.getAll()
    config[key] = value

    writeFileSync(VRN_CONFIG_FILE, YAML.stringify(config))
  }
}
