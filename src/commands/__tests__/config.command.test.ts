/*
 * @Author: Cphayim
 * @Date: 2020-09-14 16:10:43
 * @LastEditTime: 2020-09-14 16:50:40
 * @Description:
 */

import { VRN_CONFIG_FILE, VrnConfig, getVrnConfig, setVrnConfig, VRN_CONFIG } from '@/config'

import ConfigCommand from '../config.command'

describe('Test config.command', () => {
  const originConf = getVrnConfig()

  beforeAll(() => {})
  afterAll(() => setVrnConfig(originConf))

  test('set registry', () => {
    const cmd: ConfigCommand = new ConfigCommand()
    const registry = 'http://127.0.0.1:5001'
    cmd.handleSet('registry', registry)
    expect(VRN_CONFIG.registry).toBe(registry)
    expect(getVrnConfig().registry).toBe(registry)
  })
})
