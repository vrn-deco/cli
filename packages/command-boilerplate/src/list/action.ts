/*
 * @Author: Cphayim
 * @Date: 2021-07-29 16:12:23
 * @Description:
 */
import path from 'path'
import fs from 'fs-extra'
import YAML from 'yaml'

import { colors } from '@vrn-deco/cli-log'
import { Action, ActionArgs } from '@vrn-deco/cli-command'
import { Manifest } from '@vrn-deco/protocol-boilerplate'

import { BoilerplateService } from '../services/boilerplate.service'

type ListArguments = []
type ListOptions = {
  json: boolean
  yaml: boolean
  outFile: string // 结果输出到文件
}

export type ListActionArgs = ActionArgs<ListArguments, ListOptions>

/**
 * 输出类型
 */
const enum OutputType {
  Simple,
  Json,
  Yaml,
}

export class ListAction extends Action<ListArguments, ListOptions> {
  private boilerplateService = new BoilerplateService()

  private outputType = OutputType.Simple
  private manifest!: Manifest
  private outputFile: string | undefined

  async initialize(): Promise<void> {
    if (this.options.yaml) this.outputType = OutputType.Yaml
    else if (this.options.json) this.outputType = OutputType.Json

    if (this.options.outFile) {
      this.outputFile = path.resolve(process.cwd(), this.options.outFile)
    }

    this.manifest = await this.boilerplateService.getManifest()
  }

  async execute(): Promise<void> {
    const handleMap = {
      [OutputType.Json]: this.getJSON,
      [OutputType.Yaml]: this.getYAML,
      [OutputType.Simple]: this.getPure,
    }
    const result = (handleMap[this.outputType] ?? handleMap[OutputType.Simple]).call(this)
    process.stdout.write(result + '\n')

    if (this.outputFile) {
      const dir = path.dirname(this.outputFile)
      fs.mkdirpSync(dir)
      fs.writeFileSync(this.outputFile, result, { encoding: 'utf8' })
    }
  }

  async clear(): Promise<void> {
    //
  }

  getJSON(): string {
    return JSON.stringify(this.manifest, null, 2)
  }

  getYAML(): string {
    return YAML.stringify(this.manifest)
  }

  getPure(): string {
    let str = ''
    this.manifest.forEach((lang) => {
      str += `- ${lang.name}\n`
      lang.boilerplate.forEach((boilerplate) => {
        str += `  - ${boilerplate.name} ` + colors.gray(`${boilerplate.package}@${boilerplate.version}\n`)
      })
    })
    return str
  }
}
