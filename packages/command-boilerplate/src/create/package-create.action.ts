/*
 * @Author: Cphayim
 * @Date: 2022-02-28 21:49:05
 * @Description: create action for package mode
 */
import type { Boilerplate, Lang, PresetRunner } from '@vrn-deco/boilerplate-protocol'
import { prompt } from '@vrn-deco/cli-command'
import { readConfig } from '@vrn-deco/cli-config-helper'
import { logger } from '@vrn-deco/cli-log'
import type { NPMPackage } from '@vrn-deco/cli-npm-helper'
import { dynamicImport } from '@vrn-deco/cli-shared'

import { PostGit } from '../common.js'
import { PackageBoilerplateService } from '../services/boilerplate.service.js'
import { CreateAction } from './create.action.js'

/**
 * Selected interactively from the `manifest-package`
 * or passed in command line parameters `--target-boilerplate`
 *
 * Focus only on the `package`, `version` fields
 */
type SimplifiedBoilerplate = Pick<Boilerplate, 'package' | 'version'>

export class PackageCreateAction extends CreateAction {
  boiService!: PackageBoilerplateService
  boilerplate!: SimplifiedBoilerplate

  override async initialize(): Promise<void> {
    await super.initialize()
    this.boiService = new PackageBoilerplateService(this.options.manifestPackage)
    this.boilerplate = await this.inquireBoilerplate()
    logger.verbose('boilerplate:')
    logger.verbose(this.boilerplate)
  }

  override async execute(): Promise<void> {
    await super.execute()
    const pkg = await this.pullBoiPackage()
    await this.installBoilerplate(pkg)
  }

  override async clear(): Promise<void> {
    await super.clear()
  }

  async inquireBoilerplate(): Promise<SimplifiedBoilerplate> {
    // non-interactive
    if (this.options.yes) {
      if (!this.options.targetBoilerplate) throw new Error('missing option --target-boilerplate')
      return {
        package: this.options.targetBoilerplate,
        version: 'latest',
      }
    }

    // interactive
    const manifest = await this.boiService.loadManifest()
    if (!manifest.length) {
      throw new Error('boilerplate manifest is empty')
    }

    const { boilerplate } = await prompt<{ lang: Lang; boilerplate: Boilerplate }>([
      {
        name: 'lang',
        message: 'Select a programming language: ',
        type: 'list',
        choices: manifest.map((lang: Lang) => ({
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

  async pullBoiPackage(): Promise<NPMPackage> {
    const pkg = await this.boiService.loadBoilerplate(this.boilerplate.package, this.boilerplate.version)
    logger.verbose('pull boi-package:' + pkg.packageDir)
    return pkg
  }

  async installBoilerplate(boiPackage: NPMPackage) {
    logger.info('Start creating a project with boilerplate package...')

    const config = readConfig()
    const { name, version, author } = this.baseInfo

    try {
      const runner: PresetRunner = (await dynamicImport(boiPackage.mainScript)).default
      await runner({
        targetDir: this.targetDirectory,
        boiPackageDir: boiPackage.packageDir,
        name,
        version,
        author,
        packageManager: config.packageManager,
        autoInstallDeps: this.options.autoInstallDeps,
        gitInit: this.options.postGit !== PostGit.Remove, // default always init git
      })
    } catch (error) {
      logger.verbose(`PresetRunner Error: ${error.message}`)
      throw new Error('Boilerplate runner execution failed')
    }
  }
}
