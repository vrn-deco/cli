import path from 'node:path'
import { execaCommandSync } from 'execa'
import { logger } from '@ombro/logger'

export function cleanDeps() {
  logger.startLoading('Cleaning dependencies...')
  execaCommandSync('pnpm -wr exec -- rimraf node_modules', { stdio: 'inherit', cwd: path.resolve(__dirname, '../') })
  logger.stopLoading()
  logger.done('Cleaned dependencies.')
}

export function cleanBuild() {
  logger.startLoading('Cleaning build...')
  execaCommandSync('pnpm -r exec -- rimraf dist coverage *.tsbuildinfo', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '../'),
  })
  logger.stopLoading()
  logger.done('Cleaned build.')
}

if (require.main === module) {
  process.argv.includes('--build') && cleanBuild()
  process.argv.includes('--deps') && cleanDeps()
}
