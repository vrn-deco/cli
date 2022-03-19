import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execaCommandSync } from 'execa'
import { cleanBuild } from './clean'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function build() {
  execaCommandSync('pnpm -r build', { stdio: 'inherit', cwd: path.join(__dirname, '..') })
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.argv.includes('--no-cache') && cleanBuild()
  build()
}
