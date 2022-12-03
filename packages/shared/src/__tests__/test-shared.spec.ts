import { expect, test } from 'vitest'

import { SwitchStatus } from '../enum.js'
import { injectTestEnv } from '../test-shared.js'

test('Environment variables for testing should be injected', () => {
  injectTestEnv()
  expect(process.env.VRN_CLI_DEBUG_ENABLED).toBe(SwitchStatus.Off)
  expect(process.env.VRN_CLI_NAME).toBeDefined()
  expect(process.env.VRN_CLI_PACKAGE_NAME).toBeDefined()
  expect(process.env.VRN_CLI_VERSION).toBeDefined()
  expect(process.env.VRN_CLI_HOME_PATH).toBeDefined()
  expect(process.env.VRN_CLI_LOWEST_NODE_VERSION).toBeDefined()
  expect(process.env.VRN_CLI_MODULE_MAP).toBeDefined()

  injectTestEnv(true)
  expect(process.env.VRN_CLI_DEBUG_ENABLED).toBe(SwitchStatus.On)
})
