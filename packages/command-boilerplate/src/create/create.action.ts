/*
 * @Author: Cphayim
 * @Date: 2021-07-26 12:35:27
 * @Description: create action
 */
import os from 'node:os'
import path from 'node:path'

import fs from 'fs-extra'

import type { APIBoilerplate, Boilerplate, Lang } from '@vrn-deco/boilerplate-protocol'
import { Action, type ActionArgs, prompt } from '@vrn-deco/cli-command'
import { colors, logger } from '@vrn-deco/cli-log'

import type { ModeOptions, PostGit } from '../common.js'
import { isValidProjectName, isValidVersion } from '../utils.js'

type FolderName = string
type BaseDirectory = string

export type CreateArguments = [FolderName, BaseDirectory]
export type CreateOptions = ModeOptions & {
  yes: boolean
  name: string
  version: string
  author: string
  targetBoilerplate: string
  manifestPackage: string
  apiUrl: string
  postGit: PostGit
  autoInstallDeps: boolean
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

const DEFAULT_AUTHOR = os.userInfo().username

export class CreateAction extends Action<CreateArguments, CreateOptions> {
  DEFAULT_BASE_DIRECTORY = '.'

  folderName!: string
  baseDirectory!: string
  targetDirectory!: string
  baseInfo!: ProjectBaseInfo

  /**
   * initialize step
   *
   * check and get all necessary parameters
   */
  override async initialize(requiredBaseInfo = true): Promise<void> {
    let [folderName, baseDirectory] = this.arguments

    if (folderName) {
      this.folderName = folderName
    } else {
      // - called via vrn create with no arguments
      // - called via create-vrn package
      this.folderName = await this.inquireFolderName()
    }

    this.baseDirectory = path.resolve(process.cwd(), baseDirectory ?? this.DEFAULT_BASE_DIRECTORY)

    if (!isValidProjectName(this.folderName))
      throw new Error(`the 'folderName' must conform to the npm package name specification: ${this.folderName}`)

    await this.verifyDirectory()
    this.targetDirectory = path.join(this.baseDirectory, this.folderName)

    if (requiredBaseInfo) {
      this.baseInfo = await this.inquireBaseInfo()

      logger.verbose('baseInfo:')
      logger.verbose(this.baseInfo)
    }
  }

  override async execute(): Promise<void> {
    //
  }

  override async clear(): Promise<void> {
    logger.done(`Project created successfully, located at ${this.targetDirectory}\nHappy coding!`)
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

  async inquireFolderName(): Promise<string> {
    // non-interactive should be passed via arguments
    if (this.options.yes) throw new Error('missing arguments: folderName')

    const { folderName } = await prompt<{ folderName: string }>([
      {
        name: 'folderName',
        message: 'Folder name: ',
      },
    ])
    return folderName
  }

  async inquireBaseInfo(): Promise<ProjectBaseInfo> {
    // non-interactive
    if (this.options.yes) {
      const { name, version, author } = this.options
      if (!isValidProjectName(this.options.name))
        throw new Error('missing option --name or not a valid npm package name')
      if (!isValidVersion(this.options.version)) throw new Error('missing option --version or not a valid version')
      if (!author) throw new Error('missing option --author')
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
        default: DEFAULT_AUTHOR,
      },
    ])
    return baseInfo
  }

  getBoilerplateChoiceName(boilerplate: Boilerplate | APIBoilerplate): string {
    let parts: string[] = [boilerplate.name]
    // tags
    if (boilerplate.tags && boilerplate.tags.length) {
      parts.push(colors.yellow(`(${boilerplate.tags.join(', ')})`))
    }
    // version
    parts.push(colors.gray(`v${boilerplate.version}`))
    // recommended and deprecated
    boilerplate.recommended && parts.push(colors.green('<recommended>'))
    boilerplate.deprecated && parts.push(colors.red('<deprecated>'))
    return parts.join(' ')
  }

  getLanguageChoiceName(lang: Lang | Lang<APIBoilerplate>): string {
    let parts: string[] = [lang.name]
    // recommended and deprecated
    lang.recommended && parts.push(colors.green('<recommended>'))
    lang.deprecated && parts.push(colors.red('<deprecated>'))
    return parts.join(' ')
  }
}
