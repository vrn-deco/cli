/*
 * @Author: Cphayim
 * @Date: 2021-06-25 21:55:47
 * @Description: 环境变量和模块声明
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace NodeJS {
  export interface ProcessEnv {
    /**
     * 日志等级
     */
    LOGGER_LEVEL: 'verbose' | 'info' | 'notice' | 'warn' | 'error' | 'silent'
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
     * 脚手架版本
     */
    VRN_CLI_VERSION: string
    /**
     * 脚手架主目录
     */
    VRN_CLI_HOME_PATH: string
  }
}

declare module '*.json'
