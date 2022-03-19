import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execaCommandSync } from 'execa'
import { logger } from '@ombro/logger'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function cleanDeps() {
  logger.startLoading('Cleaning dependencies...')
  execaCommandSync('pnpm -wr exec -- rimraf node_modules', { stdio: 'inherit', cwd: path.join(__dirname, '..') })
  logger.stopLoading()
  logger.done('Cleaned dependencies.')
}

export function cleanBuild() {
  logger.startLoading('Cleaning build...')
  execaCommandSync('pnpm -r exec -- rimraf dist coverage *.tsbuildinfo', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  })
  logger.stopLoading()
  logger.done('Cleaned build.')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.argv.includes('--build') && cleanBuild()
  process.argv.includes('--deps') && cleanDeps()
}
