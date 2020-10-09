/*
 * @Author: Cphayim
 * @Date: 2020-09-14 16:10:43
 * @LastEditTime: 2020-10-09 14:32:08
 * @Description:
 */
import { existsSync, readFileSync, statSync, writeFileSync } from 'fs'

import { VRN_CONFIG_FILE } from '@/constants'

import ConfigService from '../config.service'

describe('Test config.service', () => {
  let originConfigString: string = ''
  const service = new ConfigService()

  beforeAll(() => {
    if (existsSync(VRN_CONFIG_FILE) && statSync(VRN_CONFIG_FILE).isFile()) {
      originConfigString = readFileSync(VRN_CONFIG_FILE, { encoding: 'utf8' })
    }
  })
  afterAll(() => {
    if (originConfigString) {
      writeFileSync(originConfigString, originConfigString, { encoding: 'utf8' })
    }
  })

  test('set registry', () => {
    const registry = 'http://127.0.0.1:5001'
    service.set('registry', registry)
    const config = service.getAll()
    expect(config.registry).toBe(registry)
  })
})
