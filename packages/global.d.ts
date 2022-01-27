/*
 * @Author: Cphayim
 * @Date: 2021-07-16 23:32:04
 * @Description: 全局类型定义
 */

declare const enum SwitchStatus {
  On = 'on',
  Off = 'off',
}

/**
 * 环境变量
 */
type VRNEnv = {
  /**
   * 调试模式开关
   */
  VRN_CLI_DEBUG_ENABLED: SwitchStatus

  /**
   * 显示名称
   */
  VRN_CLI_NAME: string

  /**
   * 主包名
   */
  VRN_CLI_PACKAGE_NAME: string

  /**
   * 主包版本
   */
  VRN_CLI_VERSION: string

  /**
   * 应用主目录
   */
  VRN_CLI_HOME_PATH: string

  /**
   * 最低兼容的 Node.js 版本
   */
  VRN_CLI_LOWEST_NODE_VERSION: string

  /**
   * 本地模块映射
   * jsonstr: Record<模块名, 绝对路径>
   */
  VRN_CLI_MODULE_MAP: string
}

declare namespace NodeJS {
  interface ProcessEnv extends VRNEnv {}
}
