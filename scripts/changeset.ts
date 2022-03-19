import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execaCommandSync } from 'execa'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// add changes
export async function changesetAdd() {
  execaCommandSync('pnpm changeset add', { stdio: 'inherit', cwd: path.join(__dirname, '..') })
}

// release changes to version
export async function changesetVersion() {
  execaCommandSync('pnpm changeset version', { stdio: 'inherit', cwd: path.join(__dirname, '..') })
  execaCommandSync('pnpm -r exec -- rimraf CHANGELOG.md', { stdio: 'inherit', cwd: path.join(__dirname, '..') })
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.argv.includes('--version') ? changesetVersion() : changesetAdd()
}
