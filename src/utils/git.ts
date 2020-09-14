/*
 * @Author: Cphayim
 * @Date: 2020-09-14 10:46:11
 * @LastEditTime: 2020-09-14 11:03:56
 * @Description: git 工具
 */
import sh from 'shelljs'

export function hasGit(): boolean {
  return !!sh.which('git')
}

export function initGitRepository(path: string = '.'): boolean {
  const { stderr } = sh
    .cd(path)
    .exec('git init && git add . && git commit -am "feat: init project"', { silent: true })
  return !stderr
}
