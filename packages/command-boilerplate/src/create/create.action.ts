/*
 * @Author: Cphayim
 * @Date: 2021-07-26 12:35:27
 * @Description: create action
 */
import path from 'node:path'
import os from 'node:os'
import fs from 'fs-extra'
import { APIBoilerplate, Boilerplate } from '@vrn-deco/boilerplate-protocol'

import { Action, ActionArgs, prompt } from '@vrn-deco/cli-command'
import { colors, logger } from '@vrn-deco/cli-log'

import { isValidProjectName, isValidVersion } from '../utils.js'
import { ModeOptions, PostGit } from '../common.js'

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

    this.folderName = folderName
    this.baseDirectory = path.resolve(process.cwd(), baseDirectory ?? this.DEFAULT_BASE_DIRECTORY)

    if (!isValidProjectName(this.folderName)) {
      throw new Error(`the 'folderName' must conform to the npm package name specification: ${this.folderName}`)
    }

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
    let name = boilerplate.name
    if (boilerplate.desc) {
      name += ' ' + colors.gray(boilerplate.desc)
    }
    if (boilerplate.tags && boilerplate.tags.length) {
      name += ' ' + colors.gray(boilerplate.tags.join(','))
    }
    return name
  }
}
