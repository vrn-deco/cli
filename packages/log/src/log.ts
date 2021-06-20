/*
 * @Author: Cphayim
 * @Date: 2021-06-18 00:52:24
 * @Description: 日志
 */
import { EventEmitter } from 'events'
import log from 'npmlog'

export { log }

log.level = process.env.LOG_LEVEL ?? 'info'

log.heading = 'vrn'
log.headingStyle = { fg: 'blue', bg: 'grey', bold: true }

log.addLevel('success', 2000, { fg: 'green', bold: true })
log.addLevel('info', 1000, { fg: 'cyan', bg: 'black', bold: true })

declare module 'npmlog' {
  interface Logger extends EventEmitter {
    success(prefix: string, message: string, ...args: unknown[]): void
  }
}
