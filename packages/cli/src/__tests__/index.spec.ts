import { afterAll, beforeEach, expect, test, vi } from 'vitest'

import { logger } from '@vrn-deco/cli-log'

logger.setLevel('silent')

const logErrorSpy = vi.spyOn(logger, 'error')
const prepare = vi.fn(() => Promise.resolve())
const parseAsync = vi.fn(async () => void 0)
const createCLI = vi.fn(() => ({ parseAsync }))

vi.mock('../prepare.js', async () => {
  const prepareModule = await vi.importActual<typeof import('../prepare.js')>('../prepare.js')
  return {
    ...prepareModule,
    prepare,
  }
})
vi.mock('../cli.js', async () => {
  const cliModule = await vi.importActual<typeof import('../cli.js')>('../cli.js')
  return {
    ...cliModule,
    createCLI,
  }
})

const { main } = await import('../index.js')

beforeEach(() => {
  logErrorSpy.mockClear()
  prepare.mockClear()
  parseAsync.mockClear()
  createCLI.mockClear()
})

afterAll(() => {
  logErrorSpy.mockRestore()
  prepare.mockRestore()
  parseAsync.mockRestore()
  createCLI.mockRestore()
})

// entry change to top level await
// it does not cover all conditional tests
test('After import, can execute prepare and then create a cli', async () => {
  await main()
  expect(prepare).toHaveBeenCalledTimes(1)
  expect(createCLI).toHaveBeenCalledTimes(1)
  expect(parseAsync).toHaveBeenCalledTimes(1)
})

test('Capable of catching global exceptions', async () => {
  const prepareError = new Error('prepare error')
  const parseAsyncError = new Error('parseAsync error')

  prepare.mockImplementationOnce(() => {
    throw prepareError
  })
  await main() // no throw here
  expect(logErrorSpy).toHaveBeenCalledTimes(1)
  expect(logErrorSpy).toHaveBeenLastCalledWith(prepareError.message) // debug 'off'

  parseAsync.mockImplementationOnce(() => {
    throw parseAsyncError
  })
  await main() // no throw here
  expect(logErrorSpy).toHaveBeenCalledTimes(2)
  expect(logErrorSpy).toHaveBeenLastCalledWith(parseAsyncError.message) // debug 'off'

  process.env.VRN_CLI_DEBUG_ENABLED = 'on'

  prepare.mockImplementationOnce(() => {
    throw prepareError
  })
  await main() // no throw here
  expect(logErrorSpy).toHaveBeenCalledTimes(3)
  expect(logErrorSpy).toHaveBeenLastCalledWith(prepareError) // debug 'on'

  parseAsync.mockImplementationOnce(() => {
    throw parseAsyncError
  })
  await main() // no throw here
  expect(logErrorSpy).toHaveBeenCalledTimes(4)
  expect(logErrorSpy).toHaveBeenLastCalledWith(parseAsyncError) // debug 'on'
})
