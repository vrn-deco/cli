/*
 * @Author: Cphayim
 * @Date: 2021-07-23 16:36:28
 * @Description: Action 抽象类与相关类型
 */
import { Command } from 'commander'
import { logger } from '@vrn-deco/cli-log'

export type Arguments = readonly unknown[]
export type Options = { [key: string]: unknown }
export type ActionArgs<A extends Arguments, O extends Options> = [...A, O, Command]

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
    this.command = args.pop() as Command
    this.options = args.pop() as O
    this.arguments = args.slice() as unknown as A
    this.verifyEnv()
  }

  get className(): string {
    return Object.getPrototypeOf(this).constructor.name
  }

  async run() {
    logger.debug(`<${this.className}> initialize...`)
    await this.initialize()

    logger.debug(`<${this.className}> execute...`)
    await this.execute()

    logger.debug(`<${this.className}> clear...`)
    await this.clear()
  }

  protected abstract initialize(): void | Promise<void>

  protected abstract execute(): void | Promise<void>

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
