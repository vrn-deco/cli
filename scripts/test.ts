import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execaSync } from 'execa'
import { logger } from '@ombro/logger'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function unitTest() {
  try {
    execaSync('vitest', ['run', ...process.argv.slice(2)], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    })
    logger.done('Passed test!')
  } catch (error) {
    logger.error('Failed test!')
    process.exit(error.exitCode)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  unitTest()
}
