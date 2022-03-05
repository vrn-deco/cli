import { jest } from '@jest/globals'
import { logger } from '@vrn-deco/cli-log'

logger.setLevel('silent')

const prepare = jest.fn(() => Promise.resolve())

const parseAsync = jest.fn(async () => void 0)
const createCLI = jest.fn(() => ({ parseAsync }))

const prepareModule = await import('../prepare.js')
jest.unstable_mockModule('../prepare.js', () => ({
  ...prepareModule,
  prepare,
}))

const cliModule = await import('../cli.js')
jest.unstable_mockModule('../cli.js', () => ({
  ...cliModule,
  createCLI,
}))

// entry change to top level await
// it does not cover all conditional tests
test('After import, can execute prepare and then create a cli', async () => {
  await import('../index.js')
  expect(prepare).toHaveBeenCalledTimes(1)
  expect(createCLI).toHaveBeenCalledTimes(1)
})
