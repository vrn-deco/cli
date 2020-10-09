/*
 * @Author: Cphayim
 * @Date: 2020-09-11 15:09:50
 * @LastEditTime: 2020-10-03 02:54:32
 * @Description: 配置文件
 */

import path from 'path'

const pkg = require('@/../package')

// 基本信息
export const APP_NAME = 'vrn-cli'
export const PACKAGE_NAME: string = pkg.name
export const PACKAGE_VERSION: string = pkg.version

// 关键路径
/**
 * 项目根路径
 */
export const ROOT_DIR = path.join(__dirname, '..', '..')
/**
 * 当前终端路径
 */
export const PWD_DIR = process.cwd()
/**
 * 用户目录路径
 */
export const USER_HOME_DIR = process.env.HOME ?? process.env.USERPROFILE

// .vrnconfig 文件
export const VRN_CONFIG_FILE = path.join(USER_HOME_DIR, '.vrnconfig')
