/*
 * @Author: Cphayim
 * @Date: 2020-09-14 16:10:43
 * @LastEditTime: 2020-10-09 09:58:21
 * @Description:
 */

import ConfigService from '../config.service'

describe('Test config.service', () => {
  beforeAll(() => {})
  afterAll(() => {})

  const service = new ConfigService()

  // 读
  test('read .vrnconfig file', () => {
    expect(service.getAll).not.toThrow()
    const config = service.getAll()
    expect(config).not.toBeUndefined()
    expect(config).not.toBeNull()
  })

  // 写
  test('write .vrnconfig file', () => {
    const registry = 'http://127.0.0.1:5001'
    service.set('registry', registry)
    expect(service.getAll).not.toThrow()
    const config = service.getAll()
    expect(config.registry).toBe(registry)
  })
})
