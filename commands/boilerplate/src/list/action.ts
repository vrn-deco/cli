/*
 * @Author: Cphayim
 * @Date: 2021-07-29 16:12:23
 * @Description:
 */
import path from 'path'
import fs from 'fs-extra'
import YAML from 'yaml'

import { colors } from '@vrn-deco/logger'
import { Action, ActionArgs } from '@vrn-deco/command'
import { Manifest } from '@vrn-deco/protocol-boilerplate'

import { BoilerplateService } from '../services/boilerplate.service'

type ListArguments = []
type ListOptions = {
  json: boolean
  yaml: boolean
  outFile: string // 结果输出到文件
}

export type ListActionArgs = ActionArgs<ListArguments, ListOptions>

export default function factory(...args: ListActionArgs): ListAction {
  return new ListAction(...args)
}

const enum OutputType {
  pure,
  json,
  yaml,
}

export class ListAction extends Action<ListArguments, ListOptions> {
  private boilerplateService = new BoilerplateService()

  private outputType = OutputType.pure
  private manifest!: Manifest
  private outputFile: string | undefined

  async initialize(): Promise<void> {
    await super.initialize()

    if (this._opts.yaml) this.outputType = OutputType.yaml
    else if (this._opts.json) this.outputType = OutputType.json

    if (this._opts.outFile) {
      this.outputFile = path.resolve(process.cwd(), this._opts.outFile)
    }

    this.manifest = await this.boilerplateService.getManifest()
  }

  async execute(): Promise<void> {
    await super.execute()
    const handleMap = {
      [OutputType.json]: this.getJSON,
      [OutputType.yaml]: this.getYAML,
      [OutputType.pure]: this.getPure,
    }
    const result = (handleMap[this.outputType] ?? handleMap[OutputType.pure]).call(this)
    process.stdout.write(result + '\n')

    if (this.outputFile) {
      const dir = path.dirname(this.outputFile)
      fs.mkdirpSync(dir)
      fs.writeFileSync(this.outputFile, result, { encoding: 'utf8' })
    }
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
