/*
 * @Author: Cphayim
 * @Date: 2021-07-16 23:32:04
 * @Description: global types
 */

/**
 * process.env type
 */
type VRNEnv = {
  /**
   * cli global debug mode swtich
   */
  VRN_CLI_DEBUG_ENABLED: SwitchStatus

  /**
   * cli display name
   */
  VRN_CLI_NAME: string

  /**
   * cli main package name
   */
  VRN_CLI_PACKAGE_NAME: string

  /**
   * cli main package version
   */
  VRN_CLI_VERSION: string

  /**
   * cli used home directory
   */
  VRN_CLI_HOME_PATH: string

  /**
   * lowest supported node version
   */
  VRN_CLI_LOWEST_NODE_VERSION: string

  /**
   * local module mapping
   * jsonstr: Record<moduleName, localAbsolutePath>
   */
  VRN_CLI_MODULE_MAP: string
}

declare namespace NodeJS {
  interface ProcessEnv extends VRNEnv {}
}

/**
 * config items switch status
 */
declare const enum SwitchStatus {
  On = 'on',
  Off = 'off',
}

/**
 * supported package manager
 */
declare const enum PackageManager {
  NPM = 'npm',
  Yarn = 'yarn',
  PNPM = 'pnpm',
}

/**
 * package dist tag
 */
declare const enum DistTag {
  Latest = 'latest',
  Next = 'next',
  Legacy = 'legacy',
}

/**
 * build-in npm registry
 */
declare const enum NPMRegistry {
  NPM = 'https://registry.npmjs.org',
  TAOBAO = 'https://registry.npmmirror.com',
}
