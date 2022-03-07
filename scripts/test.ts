import path from 'node:path'
import { execaSync } from 'execa'
import { logger } from '@ombro/logger'

function unitTest() {
  try {
    execaSync('jest', process.argv.slice(2), {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '../'),
      env: { ...process.env, NODE_OPTIONS: '--experimental-vm-modules', NODE_NO_WARNINGS: '1' },
    })
    logger.done('Passed test!')
  } catch (error) {
    logger.error('Failed test!')
    process.exit(error.exitCode)
  }
}

if (require.main === module) {
  unitTest()
}
