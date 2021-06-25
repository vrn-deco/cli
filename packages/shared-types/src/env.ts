/*
 * @Author: Cphayim
 * @Date: 2021-06-25 21:55:47
 * @Description: 环境变量和模块声明
 */

namespace NodeJS {
  export interface ProcessEnv {
    /**
     * 日志等级
     */
    LOGGER_LEVEL: 'verbose' | 'info' | 'notice' | 'warn' | 'error' | 'silent'
    /**
     * 是否启动调试
     */
    VRN_CLI_DEBUG_ENABLED: 'on' | 'off'
    /**
     * 脚手架包名
     */
    VRN_CLI_NAME: string
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
