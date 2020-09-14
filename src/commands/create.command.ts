/*
 * @Author: Cphayim
 * @Date: 2020-09-11 15:38:07
 * @LastEditTime: 2020-09-14 13:26:15
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
import { VRN_CONFIG, PWD_DIR } from '@/config'
import BoilerplateService from '@/ services/boilerplate.service'
import { Category } from '@/models/boilerplate'
import { hasGit, initGitRepository } from '@/utils/git'

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
   * 1. 拉取指定 registry 的配置文件 boilerplate.yml
   * 2. 使用配置项生成交互式引导，根据用户交互结果返回创建配置 CreatorOptions
   * 3. 安装项目模板到指定目录
   *
   * @param projectName
   */
  private async _handleCreate(projectName: string) {
    if (this.cmd.debug) Logger.debug('当前正以调试模式启动', { devOnly: false })

    try {
      // 1
      const categories: Category[] = await this._fetchRemoteBoilerplateConfig()
      // 2
      const creatorOptions: CreatorOptions = await this._interactiveGuide(projectName, categories)
      // 3
      await this._install(creatorOptions)
    } catch (error) {
      Logger.error(error.message)
      process.exit(1)
    }
  }

  /**
   * 拉取远端 boilerplate 配置
   */
  private async _fetchRemoteBoilerplateConfig(): Promise<Category[]> {
    // 检查 vrnconfig 中是否配置了 registry
    if (!VRN_CONFIG.registry) throw Error('似乎还没有配置 registry，请先执行 vrn config')
    try {
      return await new BoilerplateService().fetchBoilerplateConfig()
    } catch (error) {
      throw this.cmd.debug ? error : new Error('拉取远端 boilerplate 配置失败')
    }
  }

  /**
   * 创建交互式引导
   * @param defaultName 默认项目名
   * @param categories boilerplate 配置表
   */
  private async _interactiveGuide(
    defaultName: string,
    categories: Category[],
  ): Promise<CreatorOptions> {
    try {
      const projectName = await this._getProjectName(defaultName)
      const categoryIndex = await this._getCategoryIndex(categories)
      const boilerplate = await this._getBoilerplate(categories, categoryIndex)
      return new CreatorOptions(projectName, categoryIndex, boilerplate)
    } catch (error) {
      throw this.cmd.debug ? error : new Error('交互式引导发生异常')
    }
  }

  // 交互式获取项目名
  private async _getProjectName(defaultName: string): Promise<string> {
    const { projectName } = await inquirer.prompt<CreatorOptions>([
      {
        type: 'input',
        name: 'projectName',
        message: '项目名称',
        default: defaultName,
        validate: (val: string) =>
          /^[a-z\d-]+$/.test(val)
            ? true
            : `项目名称需要符合 npm package 命名规范，仅包含小写字母、数字与'-'`,
      },
    ])
    return projectName
  }

  // 交互式获取分类索引
  private async _getCategoryIndex(categories: Category[]): Promise<number> {
    const { categoryIndex } = await inquirer.prompt<CreatorOptions>([
      {
        type: 'list',
        name: 'categoryIndex',
        message: '技术选型',
        choices: categories.map((item, index) => ({ name: item.title, value: index })),
        pageSize: 4,
      },
    ])
    return categoryIndex
  }

  // 获取模板名
  private async _getBoilerplate(categories: Category[], categoryIndex: number): Promise<string> {
    const { boilerplates } = categories[categoryIndex]
    const { boilerplate } = await inquirer.prompt<CreatorOptions>([
      {
        type: 'list',
        name: 'boilerplate',
        message: '样板选型',
        choices: boilerplates.map((item) => {
          // xxx boilerplate v1.0.0 (aaa / bbb)
          let name = `${item.title} boilerplate v${item.version} ${
            item.tags && item.tags.length ? '(' + item.tags.join(' / ') + ')' : ''
          }`
          return { name, value: item.tgz }
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
  private async _install(options: CreatorOptions): Promise<void> {
    // 创建目录的绝对路径
    const absPath = path.join(PWD_DIR, options.projectName)
    if (existsSync(absPath) && statSync(absPath).isDirectory()) {
      throw new Error(`路径下已经存在同名目录，无法重复创建: ${absPath}`)
    }
    // 1
    Logger.info(`开始下载样板压缩包: ${options.boilerplate}`)
    try {
      await new BoilerplateService().downloadBoilerplate(options.boilerplate, PWD_DIR)
      Logger.success(`下载样板压缩包成功`)
    } catch (error) {
      throw this.cmd.debug ? error : new Error('下载文件失败')
    }

    // 2 3 4
    Logger.info(`开始解压文件: ${options.boilerplate}`)
    try {
      await tgz.uncompress(join(PWD_DIR, options.boilerplate), PWD_DIR)
      Logger.success(`解压文件成功`)
      // 重命名目录
      sh.mv(options.boilerplate.split('.')[0], options.projectName)
    } catch (error) {
      throw this.cmd.debug ? error : new Error(`解压文件失败`)
    } finally {
      // 清理压缩包
      sh.rm('-f', options.boilerplate)
    }

    // 5
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
    const { code: npmInstallReturnCode } = sh
      .cd(path)
      .exec(`npm install ${VRN_CONFIG.npmrepo ? '--registry ' + VRN_CONFIG.npmrepo : ''}`, {
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

class CreatorOptions {
  constructor(
    public readonly projectName: string,
    public readonly categoryIndex: number,
    public readonly boilerplate: string,
  ) {}
}
