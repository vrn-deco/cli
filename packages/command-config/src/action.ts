/*
 * @Author: Cphayim
 * @Date: 2021-07-23 15:33:13
 * @Description:
 */

import { colors, logger } from '@vrn-deco/cli-log'
import { Action, ActionArgs, prompt } from '@vrn-deco/cli-command'
import {
  BaseConfig,
  packageManagerOptions,
  npmRegistryOptions,
  readConfig,
  updateConfig,
} from '@vrn-deco/cli-config-helper'
import { noop } from '@vrn-deco/cli-shared'

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
    logger.done('配置成功')
  }

  protected clear() {
    //
  }

  private async selectField(): Promise<ConfigurableFields> {
    const { field } = await prompt<{ field: ConfigurableFields }>({
      name: 'field',
      message: '选择要修改的配置项: ',
      type: 'list',
      choices: [
        {
          name: `包管理器${this.currentValue(this.config.packageManager)}`,
          value: 'packageManager',
          short: '包管理器',
        },
        {
          name: `NPM 源${this.currentValue(this.config.npmRegistry)}`,
          value: 'npmRegistry',
          short: 'NPM 源',
        },
        {
          name: `检查更新${this.currentValue(this.config.checkUpdateEnabled)}`,
          value: 'checkUpdateEnabled',
          short: '检查更新',
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
    logger.verbose('edit NPMRegistry')
    const { npmRegistry, custom } = await prompt<{ npmRegistry: string; custom: string | undefined }>([
      {
        name: 'npmRegistry',
        message: '选择预设或自定义 NPM 源: ',
        type: 'list',
        choices: [...npmRegistryOptions, { name: 'custom', value: 'custom' }],
        default: this.config.npmRegistry,
      },
      {
        when: ({ npmRegistry }) => npmRegistry === 'custom',
        name: 'custom',
        message: '输入自定义的 NPM 源地址（自行确保有效可访问）:',
        type: 'input',
      },
    ])
    updateConfig({ npmRegistry: custom ?? npmRegistry })
  }

  private async handlePackageManagerEdit() {
    logger.verbose('edit NPMClient')
    const { NPMClient } = await prompt<{ NPMClient: BaseConfig['packageManager'] }>([
      {
        name: 'NPMClient',
        message: '选择 NPM 包管理器: ',
        type: 'list',
        choices: packageManagerOptions,
        default: this.config.packageManager,
      },
    ])
    updateConfig({ packageManager: NPMClient })
  }

  private async handleCheckUpdateEdit() {
    logger.verbose('edit CheckUpdate')
    const { yes } = await prompt<{ yes: boolean }>([
      {
        name: 'yes',
        message: '是否启用检查更新: ',
        type: 'confirm',
      },
    ])
    updateConfig({ checkUpdateEnabled: yes })
  }

  private currentValue(value?: unknown): string {
    return colors.gray(`\t\t-> ${value}`)
  }
}
