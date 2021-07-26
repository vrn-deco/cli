/*
 * @Author: Cphayim
 * @Date: 2021-07-23 16:36:28
 * @Description:
 */
import EventEmitter from 'events'
import { Command } from 'commander'

import '@vrn-deco/shared-types'
import { logger } from '@vrn-deco/logger'

export type Arguments<T extends ReadonlyArray<unknown> = []> = T
export type Options = { [key: string]: unknown }
export type ActionArgs<A extends Arguments, O extends Options> = [...A, O, Command]

export class Action<A extends Arguments, O extends Options> extends EventEmitter {
  protected _args: A
  protected _opts: O
  protected _cmd: Command

  constructor(...args: ActionArgs<A, O>) {
    super()
    this._cmd = args.pop() as Command
    this._opts = args.pop() as O
    this._args = args.slice() as A
    this.verifyEnv()
  }

  get className(): string {
    return Object.getPrototypeOf(this).constructor.name
  }

  async run(): Promise<void> {
    await this.initialize()
    await this.execute()
  }

  protected initialize(): void | Promise<void> {
    logger.verbose(`${this.className} initialize...`)
  }

  protected execute(): void | Promise<void> {
    logger.verbose(`${this.className} execute...`)
  }

  private verifyEnv() {
    if (!process.env.VRN_CLI_NAME || !process.env.VRN_CLI_PACKAGE_NAME || !process.env.VRN_CLI_VERSION) {
      throw new Error('command sub package can be invoked only through @vrn-deco/cli')
    }
  }
}
