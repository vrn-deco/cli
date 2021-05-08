/*
 * @Author: Cphayim
 * @Date: 2020-09-11 15:38:07
 * @LastEditTime: 2021-05-08 10:23:54
 * @Description: Create 命令
 */
import path, { join } from 'path'
import { existsSync, statSync } from 'fs'

import sh from 'shelljs'
import { Command } from 'commander'
import inquirer from 'inquirer'
import { tgz } from 'compressing'
import { Logger } from '@naughty/logger'

import { CommandDecorator, BaseCommand } from './base'
import { PWD_DIR } from '@/constants'
import { hasGit, initGitRepository } from '@/utils/git'
import ConfigService from '@/services/config.service'
import ResourceService from '@/services/resource.service'
import { Boilerplate, Framework, Lang, Resource } from '@/models/resource'

const examples = `Examples: vrn create my-project
`

@CommandDecorator({
  name: 'create <folder_name>',
  description: `创建项目骨架\n\n${examples}`,
  options: [
    {
      flags: '-y, --auto-install',
      description: '自动安装依赖',
      default: false,
    },
    { flags: '-n, --no-cache', description: '不缓存配置', default: false },
    { flags: '--debug', description: '调试模式', default: false },
  ],
  actionHandler(folderName: string, cmd) {
    this.boot(folderName, cmd)
  },
})
export default class CreateCommand extends BaseCommand {
  // 当前命令的 command 对象
  cmd: Command

  // 配置服务
  configService: ConfigService = new ConfigService()

  // 资源服务
  resourceService: ResourceService = new ResourceService()

  // 注册当前命令到父命令，由 Commander 装饰器实现
  registerTo(parent: Command): void {}

  // 启动器
  boot(folderName: string = '', cmd: Command): void {
    this.cmd = cmd
    this._handleCreate(folderName)
  }

  /**
   * 处理创建
   *
   * 1. 拉取指定 registry 的配置文件 resource.json
   * 2. 使用配置项生成交互式引导，根据用户交互结果返回创建配置 CreatorOptions
   * 3. 安装项目模板到指定目录
   *
   * @param projectName
   */
  private async _handleCreate(projectName: string) {
    if (this.cmd.debug) Logger.debug('当前正以调试模式启动', { devOnly: false })

    try {
      // 1
      const resource: Resource = await this.fetchRemoteResource()
      // 2
      const creatorOptions = await this.interactiveGuide(projectName, resource)
      // 3
      await this.install(creatorOptions)
    } catch (error) {
      // 统一输出错误日志
      Logger.error(error.message)
      process.exit(1)
    }
  }

  /**
   * 拉取远端 resource 配置
   */
  async fetchRemoteResource(): Promise<Resource> {
    // 检查 vrnconfig 中是否配置了 registry
    if (!this.configService.getAll().registry) {
      throw Error('似乎还没有配置 registry，请先执行 vrn config')
    }

    try {
      return await this.resourceService.fetchResource()
    } catch (error) {
      throw this.cmd.debug ? error : new Error('拉取远端 boilerplate 配置失败')
    }
  }

  /**
   * 创建交互式引导
   * @param defaultName 默认项目名
   * @param categories boilerplate 配置表
   */
  async interactiveGuide(defaultName: string, resource: Resource) {
    try {
      const projectName = await this._inputProjectName(defaultName)

      const lang = await this._chooseLang(resource)
      const framework = await this._chooseFramework(lang.frameworks)
      const boilerplate = await this._chooseBoilerplate(framework.boilerplate)

      return new CreatorOptions(projectName, boilerplate)
    } catch (error) {
      throw this.cmd.debug ? error : new Error('交互式引导发生异常')
    }
  }

  // 交互式界面：输入项目名
  private async _inputProjectName(defaultName: string): Promise<string> {
    const { projectName } = await inquirer.prompt<{ projectName: string }>({
      type: 'input',
      name: 'projectName',
      message: '项目名称',
      default: defaultName,
      validate: (val: string) =>
        /^[a-z\d-]+$/.test(val)
          ? true
          : `项目名称需要符合 npm package 命名规范，仅包含小写字母、数字与'-'`,
    })
    return projectName
  }

  // 交互式界面：选择语言
  private async _chooseLang(langs: Lang[]): Promise<Lang> {
    if (!langs.length) {
      Logger.error(`抱歉，没有可选资源`)
      throw new Error()
    }
    const { lang } = await inquirer.prompt<{ lang: Lang }>([
      {
        type: 'list',
        name: 'lang',
        message: '选择语言',
        choices: langs.map((lang) => ({ name: lang.label, value: lang })),
        pageSize: 4,
      },
    ])
    return lang
  }

  // 交互式界面：选择框架
  private async _chooseFramework(frameworks: Framework[]): Promise<Framework> {
    if (!frameworks.length) {
      Logger.error(`抱歉，没有可选资源`)
      throw new Error()
    }
    const { framework } = await inquirer.prompt<{ framework: Framework }>([
      {
        type: 'list',
        name: 'framework',
        message: '选择框架',
        choices: frameworks.map((framework) => ({ name: framework.label, value: framework })),
        pageSize: 4,
      },
    ])
    return framework
  }

  // 交互式界面：获取模板
  private async _chooseBoilerplate(boilerplateList: Boilerplate[]): Promise<Boilerplate> {
    if (!boilerplateList.length) {
      Logger.error(`抱歉，没有可选资源`)
      throw new Error()
    }
    const { boilerplate } = await inquirer.prompt<CreatorOptions>([
      {
        type: 'list',
        name: 'boilerplate',
        message: '选择模板',
        choices: boilerplateList.map((item) => {
          // $flag $label boilerplate v$version ($tag1 / $tag2)
          let name = `${item.label} boilerplate v${item.version}`
          if (item.flag) {
            name = item.flag + name
          }
          if (item.tags && item.tags.length) {
            name += ' (' + item.tags.join(' / ') + ')'
          }
          return { name, value: item }
        }),
      },
    ])
    return boilerplate
  }

  /**
   * 根据交互引导返回的结果(creatorOptions)拉取并安装模板
   *
   * 1. 下载样板压缩包
   * 2. 解压样板压缩包
   * 3. 重命名项目目录
   * 4. 移除压缩包
   * 5. 创建 git 存储库（git init）
   * 6. 安装 npm 依赖 (可选，根据参数)
   *
   * @param options
   */
  async install(options: CreatorOptions): Promise<void> {
    // 创建目录的绝对路径
    const absPath = path.join(PWD_DIR, options.projectName)
    if (existsSync(absPath) && statSync(absPath).isDirectory()) {
      throw new Error(`路径下已经存在同名目录，无法重复创建: ${absPath}`)
    }
    // 1
    Logger.info(`开始下载样板压缩包: ${options.boilerplate.key}`)
    const tgzName = options.boilerplate.key + '.tgz' // 'a' -> 'a.tgz'
    try {
      await this.resourceService.downloadBoilerplate(tgzName, PWD_DIR)
      Logger.success(`下载样板压缩包成功`)
    } catch (error) {
      throw this.cmd.debug ? error : new Error('下载文件失败')
    }

    // 2 3 4
    Logger.info(`开始解压文件: ${tgzName}`)
    try {
      // a.tgz -> a/
      await tgz.uncompress(join(PWD_DIR, tgzName), PWD_DIR)
      Logger.success(`解压文件成功`)
      // 重命名目录
      // a/ -> projectName/
      sh.mv(options.boilerplate.key, options.projectName)
    } catch (error) {
      throw this.cmd.debug ? error : new Error(`解压文件失败`)
    } finally {
      // 清理压缩包
      sh.rm('-f', tgzName)
    }

    // // 5
    if (hasGit()) {
      initGitRepository(options.projectName, !this.cmd.debug)
      Logger.success(`初始化 Git 完成...`)
    }

    // 6
    if (this.cmd.autoInstall) {
      this._autoNPMInstall(options.projectName)
    }

    this._printSuccessInfo(options.projectName)
  }

  // 安装 npm 依赖
  private _autoNPMInstall(path: string) {
    Logger.info(`正在安装依赖: npm install（可能需要一段时间，请耐心等待...）`)
    const npmrepo = this.configService.getAll().npmrepo
    const { code: npmInstallReturnCode } = sh
      .cd(path)
      .exec(`npm install ${npmrepo ? '--registry ' + npmrepo : ''}`, {
        silent: !this.cmd.debug,
      })
  }

  /**
   * 打印成功信息和引导命令
   * @param {string} projectName
   */
  private _printSuccessInfo(projectName: string): void {
    let example = `项目骨架生成完毕!\n`
    example += '\nHappy coding!\n'
    Logger.success(example)
  }
}

/**
 * 创建器选项
 */
class CreatorOptions {
  constructor(
    // 项目名称
    public readonly projectName: string,
    // 模板
    public readonly boilerplate: Boilerplate,
  ) {}
}
