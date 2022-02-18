import path from 'node:path'
import execa from 'execa'
import { logger } from '@ombro/logger'

export function cleanDeps() {
  logger.startLoading('Cleaning dependencies...')
  execa.commandSync('pnpm -wr exec -- rimraf node_modules', { stdio: 'inherit', cwd: path.resolve(__dirname, '../') })
  logger.stopLoading()
  logger.done('Cleaned dependencies.')
}

export function cleanBuild() {
  logger.startLoading('Cleaning build...')
  execa.commandSync('pnpm -r exec -- rimraf dist coverage tsconfig.tsbuildinfo', {
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
