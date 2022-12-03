/*
 * @Author: Cphayim
 * @Date: 2022-03-04 21:49:05
 * @Description: create action for git mode
 */
import path from 'node:path'

import { execa } from 'execa'
import fs from 'fs-extra'

import { logger } from '@vrn-deco/cli-log'
import { cmdExists, noop } from '@vrn-deco/cli-shared'

import { PostGit } from '../common.js'
import { CreateAction } from './create.action.js'

export class GitCreateAction extends CreateAction {
  override async initialize(): Promise<void> {
    // git mode does not require baseInfo
    await super.initialize(false)
    this.verifyGitCommand()
    this.verifyTargetBoilerplateRepository()
  }

  override async execute(): Promise<void> {
    await super.execute()
    await this.execGitClone()
    await this.postGit()
  }

  override async clear(): Promise<void> {
    await super.clear()
  }

  verifyGitCommand(): void {
    if (!cmdExists('git')) {
      throw new Error('`git` is not installed on system, please install it first')
    }
  }

  verifyTargetBoilerplateRepository(): void {
    const { targetBoilerplate } = this.options
    if (!targetBoilerplate) {
      throw new Error('missing option --target-boilerplate, it is required in git mode')
    }
    // must be a valid git repository address
    const reg = /^((https?:\/\/)|(git@))/
    if (!reg.test(targetBoilerplate)) {
      throw new Error(`option --target-boilerplate is invalid git repository address: ${targetBoilerplate}`)
    }
  }

  async execGitClone(): Promise<void> {
    logger.info('Start creating a project with git repository...')
    try {
      const gitURL = this.options.targetBoilerplate
      logger.verbose(`exec: git clone ${gitURL} ${this.folderName}`)
      await execa('git', ['clone', gitURL, this.folderName], { cwd: this.baseDirectory, stdio: 'inherit' })
    } catch (error) {
      logger.verbose(`Git clone failed: ${error.message}`)
      throw new Error('Git clone failed')
    }
  }

  async postGit(): Promise<void> {
    logger.verbose('Start post-handle...')
    logger.verbose(`PostGit -> ` + this.options.postGit)
    const handleMap: Record<PostGit, () => void | Promise<void>> = {
      [PostGit.Retain]: noop,
      [PostGit.Remove]: this.removeGit,
      [PostGit.Rebuild]: this.rebuildGit,
    }
    await handleMap[this.options.postGit].call(this)
  }

  async removeGit(): Promise<void> {
    // rm -rf .git
    fs.removeSync(path.join(this.targetDirectory, '.git'))
  }

  async rebuildGit(): Promise<void> {
    // rm -rf .git && git init && git add . && git commit -m "chore: init repository"
    await this.removeGit()
    await execa('git', ['init'], { cwd: this.targetDirectory, stdio: 'inherit' })
    await execa('git', ['add', '.'], { cwd: this.targetDirectory, stdio: 'inherit' })
    await execa('git', ['commit', '-m', 'chore: init repository'], { cwd: this.targetDirectory, stdio: 'inherit' })
  }
}
