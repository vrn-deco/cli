/*
 * @Author: Cphayim
 * @Date: 2019-06-24 08:51:40
 * @LastEditTime: 2020-09-14 10:20:00
 * @Description: 程序入口
 */
import 'source-map-support/register'
import './utils/register-alias'

import { program } from 'commander'
import { Logger } from '@naughty/logger'

import { PACKAGE_NAME, PACKAGE_VERSION } from '@/config'
import { registerCommanders } from '@/commands'
import { printLogo } from '@/utils/tools'
import { checkUpdate } from '@/utils/check-update'

export async function main(): Promise<void> {
  printLogo()

  try {
    await checkUpdate()

    program
      .version(`${PACKAGE_NAME} version: ${PACKAGE_VERSION}.`, '-v')
      .description('vrn-deco project scaffolding with command line tools.')
      .option('--registry <url>', 'registry')

    registerCommanders(program)

    program.parse(process.argv)
  } catch (error) {
    Logger.error(`Unknown error: \n${error.stack}`)
  }
}

process.addListener('beforeExit', (code: number) => {
  process.stdout.write('\n')
})
