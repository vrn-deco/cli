/*
 * @Author: Cphayim
 * @Date: 2021-07-29 16:12:23
 * @Description: boilerplate list command action
 */
import path from 'node:path'

import fs from 'fs-extra'
import YAML from 'yaml'

import type { Manifest } from '@vrn-deco/boilerplate-protocol'
import { Action, type ActionArgs } from '@vrn-deco/cli-command'
import { colors } from '@vrn-deco/cli-log'

import { type IBoilerplateProvider, PackageBoilerplateService } from '../services/boilerplate.service.js'

type ListArguments = []
type ListOptions = {
  json: boolean
  yaml: boolean
  outFile: string // output file
  manifestPackage: string
}

export type ListActionArgs = ActionArgs<ListArguments, ListOptions>

/**
 * output type
 */
enum OutputType {
  Simple,
  Json,
  Yaml,
}

export class ListAction extends Action<ListArguments, ListOptions> {
  private provider!: IBoilerplateProvider

  private outputType = OutputType.Simple
  private manifest!: Manifest
  private outputFile: string | undefined

  async initialize(): Promise<void> {
    this.provider = new PackageBoilerplateService(this.options.manifestPackage)
    if (this.options.yaml) this.outputType = OutputType.Yaml
    else if (this.options.json) this.outputType = OutputType.Json

    if (this.options.outFile) {
      this.outputFile = path.resolve(process.cwd(), this.options.outFile)
    }

    this.manifest = (await this.provider.loadManifest()) as Manifest
  }

  async execute(): Promise<void> {
    const handleMap = {
      [OutputType.Json]: this.getJSON,
      [OutputType.Yaml]: this.getYAML,
      [OutputType.Simple]: this.getSimple,
    }
    const result = handleMap[this.outputType].call(this)
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

  getSimple(): string {
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
