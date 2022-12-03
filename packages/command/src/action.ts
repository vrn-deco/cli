/*
 * @Author: Cphayim
 * @Date: 2021-07-23 16:36:28
 * @Description: Action abstract class, relevant types
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Command } from 'commander'

import { logger } from '@vrn-deco/cli-log'

export type Arguments = readonly unknown[]
export type Options = { [key: string]: unknown }
export type ActionArgs<A extends Arguments, O extends Options> = [...A, O, Command]

export const runAction =
  (C: Pick<typeof Action, keyof typeof Action> & (new (...args: any[]) => Action<Arguments, Options>)) =>
  async (...args: any[]) =>
    new C(...args).run() as any // this is deliberate, to facilitate testing and circumvent the type checking of command.action

export abstract class Action<A extends Arguments, O extends Options> {
  /**
   * command arguments received
   */
  protected readonly arguments: A
  /**
   * command options received
   */
  protected readonly options: O
  /**
   * command instance
   */
  protected readonly command: Command

  constructor(...args: ActionArgs<A, O>) {
    this.verifyEnv()

    this.command = args.pop() as Command
    this.options = args.pop() as O
    this.arguments = args.slice() as unknown as A
  }

  protected get className(): string {
    return Object.getPrototypeOf(this).constructor.name
  }

  async run(): Promise<this> {
    logger.verbose(`dispatch command to <${this.className}>`)

    logger.verbose(`<${this.className}> initialize...`)
    await this.initialize()

    logger.verbose(`<${this.className}> execute...`)
    await this.execute()

    logger.verbose(`<${this.className}> clear...`)
    await this.clear()

    return this
  }

  /**
   * initialize step
   *
   * do some preparatory work, including gathering command-line arguments,
   * interactively interrogating, and generating temporary files
   */
  protected abstract initialize(): void | Promise<void>

  /**
   * execute step
   *
   * execute specific tasks using the necessary parameters
   * collected during the initialization step
   */
  protected abstract execute(): void | Promise<void>

  /**
   * clear step
   *
   * clean up temporary data and files generated before
   */
  protected abstract clear(): void | Promise<void>

  private verifyEnv() {
    if (
      !process.env.VRN_CLI_NAME ||
      !process.env.VRN_CLI_PACKAGE_NAME ||
      !process.env.VRN_CLI_VERSION ||
      !process.env.VRN_CLI_HOME_PATH
    ) {
      throw new Error('command sub package can be invoked only through @vrn-deco/cli')
    }
  }
}
