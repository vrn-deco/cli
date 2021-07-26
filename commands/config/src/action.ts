/*
 * @Author: Cphayim
 * @Date: 2021-07-23 15:33:13
 * @Description:
 */

import { colors, logger } from '@vrn-deco/logger'
import { Action, ActionArgs, prompt } from '@vrn-deco/command'
import { BaseConfig, BaseConfigWithOptions, readConfig, updateConfig } from '@vrn-deco/cli-config'
import { NOOP } from '@vrn-deco/shared-utils'

export type ConfigArguments = []
export type ConfigOptions = {
  target: string
}
export type ConfigActionArgs = ActionArgs<ConfigArguments, ConfigOptions>

type ConfigurableFields = keyof Pick<BaseConfig, 'NPMRegistry' | 'NPMClient' | 'CheckUpdate'>

type EditFieldHandler = () => Promise<void>
type EditFieldHandlerMap = {
  [P in ConfigurableFields]: EditFieldHandler
}

export default function factory(...args: ConfigActionArgs): ConfigAction {
  return new ConfigAction(...args)
}

export class ConfigAction extends Action<ConfigArguments, ConfigOptions> {
  private configWithOptions: BaseConfigWithOptions | undefined

  protected async initialize(): Promise<void> {
    await super.initialize()
    this.loadConfigWithOptions()
    // console.log(this.configWithOptions)
  }

  protected async execute(): Promise<void> {
    await super.execute()
    const field = await this.selectField()
    logger.verbose(`selected field: ${field}`)
    await this.editItem(field)
    logger.done('配置成功')
  }

  private async selectField<F extends ConfigurableFields>(): Promise<F> {
    const { field } = await prompt<{ field: F }>({
      name: 'field',
      message: '选择要修改的配置项: ',
      type: 'list',
      choices: [
        {
          name: `NPM 源${this.currentValue(this.configWithOptions!.NPMRegistry)}`,
          value: 'NPMRegistry',
          short: 'NPM 源',
        },
        {
          name: `NPM 包管理器${this.currentValue(this.configWithOptions!.NPMClient)}`,
          value: 'NPMClient',
          short: 'NPM 包管理器',
        },
        {
          name: `检查更新${this.currentValue(this.configWithOptions!.CheckUpdate)}`,
          value: 'CheckUpdate',
          short: '检查更新',
        },
      ],
    })
    return field
  }

  private async editItem(field: ConfigurableFields) {
    const handlerMap: EditFieldHandlerMap = {
      NPMRegistry: this.handleNPMRegistryEdit.bind(this),
      NPMClient: this.handleNPMClientEdit.bind(this),
      CheckUpdate: this.handleCheckUpdateEdit.bind(this),
    }
    const handler = handlerMap[field] ?? NOOP
    await handler()
  }

  private async handleNPMRegistryEdit() {
    logger.verbose('edit NPMRegistry')
    const { NPMRegistry, custom } = await prompt<{ NPMRegistry: string; custom: string | undefined }>([
      {
        name: 'NPMRegistry',
        message: '选择预设或自定义 NPM 源: ',
        type: 'list',
        choices: [...this.configWithOptions!.NPMRegistryOptions, { name: 'custom', value: 'custom' }],
        default: this.configWithOptions!.NPMRegistry,
      },
      {
        when: ({ NPMRegistry }) => NPMRegistry === 'custom',
        name: 'custom',
        message: '输入自定义的 NPM 源地址（自行确保有效可访问）:',
        type: 'input',
      },
    ])
    updateConfig({ NPMRegistry: custom ?? NPMRegistry })
  }

  private async handleNPMClientEdit() {
    logger.verbose('edit NPMClient')
    const { NPMClient } = await prompt<{ NPMClient: BaseConfig['NPMClient'] }>([
      {
        name: 'NPMClient',
        message: '选择 NPM 包管理器: ',
        type: 'list',
        choices: this.configWithOptions!.NPMClientOptions,
        default: this.configWithOptions!.NPMClient,
      },
    ])
    updateConfig({ NPMClient })
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
    updateConfig({ CheckUpdate: yes ? 'on' : 'off' })
  }

  private loadConfigWithOptions() {
    this.configWithOptions = readConfig<BaseConfigWithOptions>()
  }

  private currentValue(value?: string): string {
    return colors.gray(`\t\t-> ${value}`)
  }
}
