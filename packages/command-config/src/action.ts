/*
 * @Author: Cphayim
 * @Date: 2021-07-23 15:33:13
 * @Description: config command action
 */
import { Action, type ActionArgs, prompt } from '@vrn-deco/cli-command'
import { type BaseConfig, readConfig, updateConfig } from '@vrn-deco/cli-config-helper'
import { colors, logger } from '@vrn-deco/cli-log'
import { NPMRegistry, PackageManager, noop } from '@vrn-deco/cli-shared'

export type ConfigArguments = []
export type ConfigOptions = Record<string, never>
export type ConfigActionArgs = ActionArgs<ConfigArguments, ConfigOptions>

type ConfigurableFields = keyof BaseConfig

type EditFieldHandler = () => Promise<void>
type EditFieldHandlerMap = {
  [P in ConfigurableFields]: EditFieldHandler
}

export class ConfigAction extends Action<ConfigArguments, ConfigOptions> {
  private config!: BaseConfig

  protected initialize() {
    this.config = readConfig<BaseConfig>()
  }

  protected async execute() {
    const field = await this.selectField()
    logger.verbose(`selected field: ${field}`)
    await this.editItem(field)
    logger.done('cli configuration is updated!')
  }

  protected clear() {
    //
  }

  private async selectField(): Promise<ConfigurableFields> {
    const { field } = await prompt<{ field: ConfigurableFields }>({
      name: 'field',
      message: 'Select a configuration item to edit: ',
      type: 'list',
      choices: [
        {
          name: `packageManager${this.currentValue(this.config.packageManager)}`,
          value: 'packageManager',
          short: 'packageManager',
        },
        {
          name: `npmRegistry${this.currentValue(this.config.npmRegistry)}`,
          value: 'npmRegistry',
          short: 'npmRegistry',
        },
        {
          name: `checkUpdateEnabled${this.currentValue(this.config.checkUpdateEnabled)}`,
          value: 'checkUpdateEnabled',
          short: 'checkUpdateEnabled',
        },
      ],
    })
    return field
  }

  private async editItem(field: ConfigurableFields) {
    const handlerMap: EditFieldHandlerMap = {
      npmRegistry: this.handleNPMRegistryEdit,
      packageManager: this.handlePackageManagerEdit,
      checkUpdateEnabled: this.handleCheckUpdateEdit,
    }
    const handler = handlerMap[field] ?? noop
    await handler.call(this)
  }

  private async handleNPMRegistryEdit() {
    logger.verbose('editing field: npmRegistry')
    const { npmRegistry, custom } = await prompt<{ npmRegistry: string; custom: string | undefined }>([
      {
        name: 'npmRegistry',
        message: 'Select a preset NPM registry or custom registry: ',
        type: 'list',
        choices: [
          { name: 'npm', value: NPMRegistry.NPM },
          { name: 'taobao', value: NPMRegistry.TAOBAO },
          { name: 'custom', value: 'custom' },
        ],
        default: this.config.npmRegistry,
      },
      {
        when: ({ npmRegistry }) => npmRegistry === 'custom',
        name: 'custom',
        message: 'Please input your custom registry: (e.g. https://registry.npmjs.org)',
        type: 'input',
        filter: (input: string) => (input.endsWith('/') ? input.slice(0, -1) : input),
      },
    ])
    updateConfig({ npmRegistry: custom ?? npmRegistry })
  }

  private async handlePackageManagerEdit() {
    logger.verbose('editing field: packageManager')
    const { packageManager } = await prompt<{ packageManager: BaseConfig['packageManager'] }>([
      {
        name: 'packageManager',
        message: 'Select a package manager: ',
        type: 'list',
        choices: [
          { name: PackageManager.NPM, value: PackageManager.NPM },
          { name: PackageManager.Yarn, value: PackageManager.Yarn },
          { name: PackageManager.PNPM, value: PackageManager.PNPM },
        ],
        default: this.config.packageManager,
      },
    ])
    updateConfig({ packageManager })
  }

  private async handleCheckUpdateEdit() {
    logger.verbose('editing field: checkUpdateEnabled')
    const { yes } = await prompt<{ yes: boolean }>([
      {
        name: 'yes',
        message: 'whether to enable check update: ',
        type: 'confirm',
      },
    ])
    updateConfig({ checkUpdateEnabled: yes })
  }

  private currentValue(value?: unknown): string {
    return colors.gray(` -> ${value}`)
  }
}
