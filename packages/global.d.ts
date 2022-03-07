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
  VRN_CLI_DEBUG_ENABLED: 'on' | 'off'

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
