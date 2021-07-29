const path = require('path')
const os = require('os')
const { NPMPackage } = require('../lib')

async function main() {
  const pkg = new NPMPackage('@vrn-deco/boilerplate-manifest', '1.0.0', {
    baseDir: path.join(os.userInfo().homedir, '.vrn-cli', 'cache'),
    depFolder: 'boilerplate',
    registry: 'https://registry.npm.taobao.org',
  })
  await pkg.load()
  console.log(pkg)
}

main()
