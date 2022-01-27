/*
 * @Author: Cphayim
 * @Date: 2021-07-26 12:35:27
 * @Description:
 */
import path from 'path'
import os from 'os'
import fs from 'fs-extra'

import { Action, ActionArgs, prompt } from '@vrn-deco/cli-command'
import { colors, logger } from '@vrn-deco/cli-log'
import { Boilerplate, Lang, Manifest } from '@vrn-deco/protocol-boilerplate'

import { BoilerplateService } from '../services/boilerplate.service'
import { isValidProjectName, isValidVersion } from '../utils'

type FolderName = string
type BaseDirectory = string

export type CreateArguments = [FolderName, BaseDirectory]
export type CreateOptions = {
  force: boolean // 当目录存在时强制覆盖
  yes: boolean // 自动化创建
  projectName: string
}
export type CreateActionArgs = ActionArgs<CreateArguments, CreateOptions>

type ProjectBaseInfo = {
  name: string
  version: `${number}.${number}.${number}`
  author: string
}

export class CreateAction extends Action<CreateArguments, CreateOptions> {
  DEFAULT_BASE_DIRECTORY = '.'

  folderName!: FolderName
  baseDirectory!: BaseDirectory
  folderDiractory!: string

  baseInfo!: ProjectBaseInfo
  boilerplate!: Boilerplate

  async initialize(): Promise<void> {
    /**
     * 1.从 args 列表获取 folderName 和 baseDirectory
     * 2.检查 folderName 的合法性
     * 3.检查 baseDirectory 的存在性，不存在询问用户是否创建
     * 4.检查 baseDirectory/folderName 是否存在，询问用户是否覆盖
     * 5.询问基本信息（项目名、版本号、作者）
     * 6.询问选择一个模板（如果传递了 --target 参数则跳过）
     */
    let [folderName, baseDirectory] = this.arguments
    this.folderName = folderName
    this.baseDirectory = path.resolve(process.cwd(), baseDirectory ?? this.DEFAULT_BASE_DIRECTORY)
    this.folderDiractory = path.join(this.baseDirectory, this.folderName)

    logger.verbose('folderName: ' + this.folderName)
    if (!isValidProjectName(this.folderName)) {
      throw new Error(`目录名需符合 npm 包名规范: ${this.folderName}`)
    }

    logger.verbose('baseDirectory: ' + this.baseDirectory)
    await this.verifyBaseDirectory()
    await this.veriryFolderDirectory()

    this.baseInfo = await this.inquireBaseInfo()

    const manifest = await new BoilerplateService().getManifest()
    this.boilerplate = await this.inquireBoilerplate(manifest)
  }

  async execute(): Promise<void> {
    //
  }

  async clear(): Promise<void> {
    //
  }

  /**
   * 检查基本路径，不存在询问用户是否创建
   */
  async verifyBaseDirectory(): Promise<void> {
    if (fs.pathExistsSync(this.baseDirectory)) return
    const { yes } = await prompt<{ yes: boolean }>({
      name: 'yes',
      message: `基础目录 ${this.baseDirectory} 不存在，是否创建？`,
      type: 'confirm',
    })
    if (yes) {
      fs.mkdirpSync(this.baseDirectory)
    } else {
      throw new Error(`基础目录不存在，用户拒绝创建`)
    }
  }

  /**
   * 检查安装目录，存在询问用户是否覆盖
   */
  async veriryFolderDirectory(): Promise<void> {
    if (!fs.pathExistsSync(this.folderDiractory) || this.options.force) return
    const { yes } = await prompt<{ yes: boolean }>({
      name: 'yes',
      message: `目录 '${this.folderDiractory}' 已经存在，是否覆盖安装？`,
      suffix: '(将清空目录，请谨慎操作)',
      type: 'confirm',
      default: false,
    })
    if (yes) {
      this.options.force = true
    } else {
      throw new Error(`目录已存在，用户拒绝覆盖`)
    }
  }

  /**
   * 询问基本信息
   */
  async inquireBaseInfo(): Promise<ProjectBaseInfo> {
    const baseInfo = await prompt<ProjectBaseInfo>([
      {
        name: 'name',
        message: '项目名称',
        default: this.folderName,
        validate: (name) => isValidProjectName(name) || `项目名需符合 npm 包名规范，输入值: ${name}`,
      },
      {
        name: 'version',
        message: '版本号',
        default: '0.0.1',
        validate: (version) => isValidVersion(version) || `版本号需符合 x.x.x，输入值: ${version}`,
      },
      {
        name: 'author',
        message: '开发者',
        default: os.userInfo().username || '',
      },
    ])
    return baseInfo
  }

  /**
   * 询问模板
   */
  async inquireBoilerplate(manifest: Manifest): Promise<Boilerplate> {
    if (!manifest.length) {
      throw new Error('模板库清单为空')
    }
    const { boilerplate } = await prompt<{ lang: Lang; boilerplate: Boilerplate }>([
      {
        name: 'lang',
        message: '选择语言',
        type: 'list',
        choices: manifest.map((lang) => ({ short: lang.name, name: lang.name, value: lang })),
      },
      {
        name: 'boilerplate',
        message: '选择模板',
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
