/*
 * @Author: Cphayim
 * @Date: 2022-03-06 21:49:05
 * @Description: create action for http mode
 */
import path from 'node:path'

import compressing from 'compressing'
import fs from 'fs-extra'

import type { APIBoilerplate, Lang } from '@vrn-deco/boilerplate-protocol'
import { prompt } from '@vrn-deco/cli-command'
import { logger } from '@vrn-deco/cli-log'

import { HTTPBoilerplateService } from '../services/boilerplate.service.js'
import { CreateAction } from './create.action.js'

/**
 * Selected interactively from the `manifest-http-api`
 * or passed in command line parameters `--target-boilerplate`
 *
 * Focus only on the `file` fields
 */
type SimplifiedBoilerplate = Pick<APIBoilerplate, 'file'>

export class HTTPCreateAction extends CreateAction {
  boiService!: HTTPBoilerplateService
  boilerplate!: SimplifiedBoilerplate

  override async initialize(): Promise<void> {
    await super.initialize()
    this.boiService = new HTTPBoilerplateService(this.options.apiUrl)
    this.boilerplate = await this.inquireBoilerplate()
    logger.verbose('boilerplate:')
    logger.verbose(this.boilerplate)
  }

  override async execute(): Promise<void> {
    await super.execute()
    const fileName = await this.downloadPackedBoilerplate()
    await this.unpackBoilerplate(fileName)
  }

  override async clear(): Promise<void> {
    await super.clear()
  }

  async inquireBoilerplate(): Promise<SimplifiedBoilerplate> {
    // non-interactive
    if (this.options.yes) {
      if (!this.options.targetBoilerplate) throw new Error('missing option --target-boilerplate')
      return {
        /**
         * e.g.
         * --target-boilerplate='https://vrndeco.cn/boilerplate/xxx.tgz'
         * Will download directly from here
         *
         * --target-boilerplate='xxx.tgz'
         * Will download from `${apiUrl}/xxx.tgz`
         */
        file: this.options.targetBoilerplate,
      }
    }

    // interactive
    const manifest = await this.boiService.loadManifest()

    if (!manifest.length) {
      throw new Error('boilerplate manifest is empty')
    }

    const { boilerplate } = await prompt<{ lang: Lang<APIBoilerplate>; boilerplate: APIBoilerplate }>([
      {
        name: 'lang',
        message: 'Select a programming language: ',
        type: 'list',
        choices: manifest.map((lang: Lang<APIBoilerplate>) => ({
          short: lang.name,
          name: this.getLanguageChoiceName(lang),
          value: lang,
        })),
      },
      {
        name: 'boilerplate',
        message: 'Select a boilerplate based on the technology stack: ',
        type: 'list',
        choices: ({ lang }) =>
          lang.boilerplate.map((boilerplate) => ({
            short: boilerplate.name,
            name: this.getBoilerplateChoiceName(boilerplate),
            value: boilerplate,
          })),
      },
    ])
    return boilerplate
  }

  /**
   * Download packed boilerplate to baseDirectory, return packed filename
   */
  async downloadPackedBoilerplate(): Promise<string> {
    const { file } = this.boilerplate
    const fileName = await this.boiService.downloadBoilerplate(file, this.baseDirectory)
    logger.verbose(`download file: ${fileName}`)
    return fileName
  }

  /**
   * According to `@vrn-deco/boilerplate-protocol`, only `.tgz`, `.tar` and `.zip` are supported
   * unsupported file extension downloaded from unknown sources need to be decompressed by the user
   */
  async unpackBoilerplate(fileName: string): Promise<void> {
    const file = path.join(this.baseDirectory, fileName)
    const ext = path.extname(file)
    try {
      if (ext === '.tgz') {
        await compressing.tgz.uncompress(file, this.baseDirectory)
      } else if (ext === '.tar') {
        await compressing.tar.uncompress(file, this.baseDirectory)
      } else if (ext === '.zip') {
        await compressing.zip.uncompress(file, this.baseDirectory)
      } else {
        throw new Error(`unsupported file extension: ${ext}`)
      }
      // unpacked directory name is `boilerplate`, change it to the target name
      fs.moveSync(path.join(this.baseDirectory, 'boilerplate'), this.targetDirectory)
      fs.removeSync(file)
    } catch (error) {
      logger.verbose(error)
      logger.warn(`Unable to unpack boilerplate: ${error.message}`)
      logger.warn(`Please try to unpack it yourself`)
    }
  }
}
