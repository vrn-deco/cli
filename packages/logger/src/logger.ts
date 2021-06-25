/*
 * @Author: Cphayim
 * @Date: 2021-06-18 00:52:24
 * @Description: 日志
 */
// import stripAnsi from 'strip-ansi'
import readline from 'readline'
import chalk from 'chalk'

import '@vrn-deco/shared-types/lib/env'

type LevelKey = typeof process.env.LOGGER_LEVEL
type LevelValue = number

export const levelMap: Record<LevelKey, LevelValue> = {
  verbose: 1,
  info: 10,
  notice: 100,
  warn: 1_000,
  error: 10_000,
  silent: 100_000,
}

let levelValue: LevelValue
setLevelValue(process.env.LOGGER_LEVEL)

const chalkTag = (msg: string) => (!msg ? '' : chalk.bgBlackBright.white.dim(` ${msg} `))

export function setLevelValue(level: LevelKey): void {
  levelValue = normalizeLevelValue(level)
}

function normalizeLevelValue(level: LevelKey) {
  return levelMap[level] ? levelMap[level] : levelMap['info']
}

function format(label: string, msg: string) {
  return msg
    .split('\n')
    .map((line, i) => {
      // return i === 0 ? `${label} ${line}` : line.padStart(stripAnsi(label).length + line.length + 1)
      return `${label} ${line}`
    })
    .join('\n')
}

function log(level: LevelKey, message: string) {
  if (normalizeLevelValue(level) < levelValue) return
  console.log(message)
}

export function verbose(message: string, tag = ''): void {
  const label = chalk.bgWhite.black(' VER ') + chalkTag(tag)
  log('verbose', format(label, message))
}

export function debug(message: string, tag = ''): void {
  const label = chalk.bgYellow.black(' DEBUG ') + chalkTag(tag)
  log('verbose', format(label, message))
}

export function info(message: string, tag = ''): void {
  const label = chalk.bgBlue.black(' INFO ') + chalkTag(tag)
  log('info', format(label, message))
}

export function done(message: string, tag = ''): void {
  const label = chalk.bgGreen.black(' DONE ') + chalkTag(tag)
  log('notice', format(label, message))
}

export function warn(message: string, tag = ''): void {
  const label = chalk.bgYellow.black(' WARN ') + chalkTag(tag)
  log('warn', format(label, chalk.yellow(message)))
}

export function error(message: string, tag = ''): void {
  const label = chalk.bgRed.black(' ERR ') + chalkTag(tag)
  log('error', format(label, chalk.red(message)))
}

export function clearConsole(title = ''): void {
  if (!process.stdout.isTTY) return
  const blank = '\n'.repeat(process.stdout.rows)
  console.log(blank)
  readline.cursorTo(process.stdout, 0, 0)
  readline.clearScreenDown(process.stdout)
  if (title) console.log(title)
}
