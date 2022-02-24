/**
 * config items switch status
 */
export enum SwitchStatus {
  On = 'on',
  Off = 'off',
}

/**
 * supported package manager
 */
export enum PackageManager {
  NPM = 'npm',
  Yarn = 'yarn',
  PNPM = 'pnpm',
}

/**
 * package dist tag
 */
export enum DistTag {
  Latest = 'latest',
  Next = 'next',
  Legacy = 'legacy',
}

/**
 * build-in npm registry
 */
export enum NPMRegistry {
  NPM = 'https://registry.npmjs.org',
  TAOBAO = 'https://registry.npmmirror.com',
}
