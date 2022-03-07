import { execaCommandSync } from 'execa'

// add changes
export async function changesetAdd() {
  execaCommandSync('pnpm changeset add', { stdio: 'inherit' })
}

// release changes to version
export async function changesetVersion() {
  execaCommandSync('pnpm changeset version', { stdio: 'inherit' })
  execaCommandSync('pnpm -r exec -- rimraf CHANGELOG.md', { stdio: 'inherit' })
}

if (require.main === module) {
  process.argv.includes('--version') ? changesetVersion() : changesetAdd()
}
