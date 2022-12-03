/*
 * @Author: Cphayim
 * @Date: 2021-06-21 01:25:57
 * @Description: package install
 */
import { execa } from 'execa'

import { NPMRegistry, PackageManager, cmdExists } from '@vrn-deco/cli-shared'

export type InstallOptions = {
  name: string
  versionOrDistTag?: string
  baseDir?: string
  registry?: string
  packageManager?: PackageManager
}

const installCommand = {
  npm: 'install',
  yarn: 'add',
  pnpm: 'add',
}

export async function installPackage({
  name,
  versionOrDistTag,
  // When not specified, the baseDir is the current working directory.
  baseDir = process.cwd(),
  // When not specified, installs using NPM registry
  registry = NPMRegistry.NPM,
  // When not specified, installs using NPM client
  packageManager = PackageManager.NPM,
}: InstallOptions): Promise<void> {
  if (!name) {
    throw new Error('name is required')
  }

  if (!cmdExists(packageManager)) {
    throw new Error(
      `packageManager ${packageManager} not found.\n` +
        `please install it first: npm i -g ${packageManager} , or select another packageManager in the cli configuration`,
    )
  }
  const nameAndVersion = versionOrDistTag ? `${name}@${versionOrDistTag}` : name
  const args = [installCommand[packageManager], nameAndVersion, '--registry', registry]

  /**
   * e.g.
   * npm install @vrn-deco/cli --registry https://registry.npmjs.org
   */
  try {
    await execa(packageManager, args, {
      cwd: baseDir,
      stdio: process.env.VRN_CLI_DEBUG_ENABLED === 'on' ? 'inherit' : 'pipe',
    })
  } catch (error) {
    if (process.env.VRN_CLI_DEBUG_ENABLED === 'on') throw error
    else throw new Error(`dependency installation failed: ${nameAndVersion}`)
  }
}
