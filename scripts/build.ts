import path from 'node:path'
import { execaCommandSync } from 'execa'
import { cleanBuild } from './clean'

function build() {
  execaCommandSync('pnpm -r build', { stdio: 'inherit', cwd: path.resolve(__dirname, '../') })
}

if (require.main === module) {
  process.argv.includes('--no-cache') && cleanBuild()
  build()
}
