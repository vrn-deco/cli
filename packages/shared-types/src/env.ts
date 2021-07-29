/*
 * @Author: Cphayim
 * @Date: 2021-06-25 21:55:47
 * @Description: 环境变量和模块声明
 */

/**
 * 环境变量: vrn-cli prepare 阶段注入
 */
type VRNEnv = {
  /**
   * 调试模式开关
   */
  VRN_CLI_DEBUG_ENABLED: 'on' | 'off'

  /**
   * 脚手架名称
   */
  VRN_CLI_NAME: string

  /**
   * 脚手架主包名
   */
  VRN_CLI_PACKAGE_NAME: string

  /**
   * 脚手架主包版本
   */
  VRN_CLI_VERSION: string

  /**
   * 脚手架主目录
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
  VRN_CLI_LOCAL_MAP: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends VRNEnv {}
  }
}

export {}
