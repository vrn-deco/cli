/*
 * @Author: Cphayim
 * @Date: 2021-07-26 12:35:27
 * @Description: boilerplate create command action
 */
import path from 'path'
import os from 'os'
import fs from 'fs-extra'
import { Boilerplate, Lang, PresetRunner } from '@vrn-deco/boilerplate-protocol'

import { Action, ActionArgs, prompt } from '@vrn-deco/cli-command'
import { colors, logger } from '@vrn-deco/cli-log'
import { NPMPackage } from '@vrn-deco/cli-npm-helper'

import { BoilerplateService } from '../services/boilerplate.service'
import { isValidProjectName, isValidVersion } from '../utils'

type FolderName = string
type BaseDirectory = string

export type CreateArguments = [FolderName, BaseDirectory]
export type CreateOptions = {
  force: boolean
  yes: boolean
  name: string
  version: string
  author: string
  targetBoilerplate: string
}
export type CreateActionArgs = ActionArgs<CreateArguments, CreateOptions>

/**
 * basic project information
 *
 * obtained through interactive query or passed in command line parameters
 */
type ProjectBaseInfo = {
  name: string
  version: string
  author: string
}

type SimplifiedBoilerpate = Pick<Boilerplate, 'package' | 'version'>

export class CreateAction extends Action<CreateArguments, CreateOptions> {
  DEFAULT_BASE_DIRECTORY = '.'

  folderName!: string
  baseDirectory!: string

  baseInfo!: ProjectBaseInfo
  boilerplate!: SimplifiedBoilerpate

  /**
   * initialize step
   *
   * check and get all necessary parameters
   */
  async initialize(): Promise<void> {
    let [folderName, baseDirectory] = this.arguments

    this.folderName = folderName
    this.baseDirectory = path.resolve(process.cwd(), baseDirectory ?? this.DEFAULT_BASE_DIRECTORY)

    if (!isValidProjectName(this.folderName)) {
      throw new Error(`the 'folderName' must conform to the npm package name specification: ${this.folderName}`)
    }

    await this.verifyDirectory()

    this.baseInfo = await this.inquireBaseInfo()
    this.boilerplate = await this.inquireBoilerplate()
  }

  async execute(): Promise<void> {
    logger.verbose('baseInfo:')
    logger.verbose(this.baseInfo)
    logger.verbose('boilerplate:')
    logger.verbose(this.boilerplate)
    const pkg = await this.pullBoiPackage()
    await this.installBoilerplate(pkg)
  }

  async clear(): Promise<void> {
    //
  }

  async verifyDirectory(): Promise<void> {
    logger.verbose('baseDirectory: ' + this.baseDirectory)
    if (!fs.pathExistsSync(this.baseDirectory)) {
      logger.verbose('baseDirectory does not exist, create it')
      fs.mkdirpSync(this.baseDirectory)
    }

    const dir = path.join(this.baseDirectory, this.folderName)
    if (fs.pathExistsSync(dir)) {
      throw new Error(`the directory '${dir}' already exists`)
    }
  }

  async inquireBaseInfo(): Promise<ProjectBaseInfo> {
    // non-interactive
    if (this.options.yes) {
      const { name, version, author } = this.options
      if (!isValidProjectName(this.options.name))
        throw new Error('missing parameter --name or not a valid npm package name')
      if (!isValidVersion(this.options.version)) throw new Error('missing parameter --version or not a valid version')
      if (!author) throw new Error('missing parameter --author')
      return { name, version, author }
    }

    // interactive
    const baseInfo = await prompt<ProjectBaseInfo>([
      {
        name: 'name',
        message: 'Project name: ',
        default: this.folderName,
        validate: (name) => isValidProjectName(name) || `not a valid npm package name`,
      },
      {
        name: 'version',
        message: 'Version: ',
        default: '0.0.1',
        validate: (version) => isValidVersion(version) || `not a valid version`,
      },
      {
        name: 'author',
        message: 'Author: ',
        default: os.userInfo().username || '',
      },
    ])
    return baseInfo
  }

  async inquireBoilerplate(): Promise<SimplifiedBoilerpate> {
    // non-interactive
    if (this.options.yes) {
      if (!this.options.targetBoilerplate) throw new Error('missing parameter --target-boilerplate')
      return {
        package: this.options.targetBoilerplate,
        version: 'latest',
      }
    }

    // interactive
    const manifest = await BoilerplateService.getInstance().loadManifest()
    if (!manifest.length) {
      throw new Error('boilerplate manifest is empty')
    }

    const { boilerplate } = await prompt<{ lang: Lang; boilerplate: Boilerplate }>([
      {
        name: 'lang',
        message: 'Select a programming language: ',
        type: 'list',
        choices: manifest.map((lang) => ({ short: lang.name, name: lang.name, value: lang })),
      },
      {
        name: 'boilerplate',
        message: 'Select a boilerplate based on the technology stack: ',
        type: 'list',
        choices: ({ lang }) =>
          lang.boilerplate.map((boilerplate) => ({
            short: boilerplate.name,
            name: getBoilerplateChoiceName(boilerplate),
            value: boilerplate,
          })),
      },
    ])
    return boilerplate
  }

  async pullBoiPackage(): Promise<NPMPackage> {
    const pkg = await BoilerplateService.getInstance().loadBoilerplate(
      this.boilerplate.package,
      this.boilerplate.version,
    )
    logger.verbose('pull boi-package:' + pkg.packageDir)
    return pkg
  }

  async installBoilerplate(boiPackage: NPMPackage) {
    const targetDir = path.join(this.baseDirectory, this.folderName)
    logger.info('Start creating a project with boilerplate package...')

    const { name, version, author } = this.baseInfo

    try {
      const runner: PresetRunner = (await import(boiPackage.mainScript)).default
      await runner({ targetDir, boiPackageDir: boiPackage.packageDir, name, version, author })
      logger.done(`Project created successfully, located at ${targetDir}\nHappy coding!`)
    } catch (error) {
      logger.verbose(`PresetRunner Error: ${error.message}`)
      throw new Error('boilerplate runner execution failed')
    }
  }
}

function getBoilerplateChoiceName(boilerplate: Boilerplate): string {
  let name = boilerplate.name
  if (boilerplate.desc) {
    name += ' ' + colors.gray(boilerplate.desc)
  }
  if (boilerplate.tags && boilerplate.tags.length) {
    name += ' ' + colors.gray(boilerplate.tags.join(','))
  }
  return name
}
