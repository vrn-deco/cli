/*
 * @Author: Cphayim
 * @Date: 2022-03-06 01:48:31
 * @Description: mock create action for testing
 */
import path from 'node:path'
import { Action } from '@vrn-deco/cli-command'

export class CreateActionMock extends Action {
  static __MOCK__ = true

  DEFAULT_BASE_DIRECTORY = '.'

  folderName
  baseDirectory
  targetDirectory
  baseInfo

  async initialize() {
    let [folderName, baseDirectory] = this.arguments

    this.folderName = folderName
    this.baseDirectory = path.resolve(process.cwd(), baseDirectory ?? this.DEFAULT_BASE_DIRECTORY)
    this.targetDirectory = path.resolve(this.baseDirectory, this.folderName)

    this.baseInfo = {
      name: this.options.name ?? 'my-project',
      version: this.options.version ?? '1.0.0',
      author: this.options.author ?? 'cphayim',
    }
  }

  async execute() {
    //
  }

  async clear() {
    //
  }

  getBoilerplateChoiceName(boilerplate) {
    let name = boilerplate.name
    return name
  }

  getLanguageChoiceName(lang) {
    let name = lang.name
    return name
  }
}
