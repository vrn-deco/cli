/*
 * @Author: Cphayim
 * @Date: 2019-07-23 08:31:25
 * @LastEditTime: 2020-09-13 01:53:06
 * @Description: 工具函数
 */
import chalk from 'chalk'
import figlet from 'figlet'

import { APP_NAME } from '@/constants'

export function printLogo() {
  const LOGO = figlet.textSync(APP_NAME.toUpperCase())
  process.stdout.write(chalk.green(LOGO) + '\n\n')
}
