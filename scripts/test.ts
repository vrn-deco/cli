import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execaSync } from 'execa'
import { logger } from '@ombro/logger'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function unitTest() {
  try {
    execaSync('jest', process.argv.slice(2), {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, NODE_OPTIONS: '--experimental-vm-modules', NODE_NO_WARNINGS: '1' },
    })
    logger.done('Passed test!')
  } catch (error) {
    logger.error('Failed test!')
    process.exit(error.exitCode)
  }
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  unitTest()
}
