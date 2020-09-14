/*
 * @Author: Cphayim
 * @Date: 2020-09-14 10:46:11
 * @LastEditTime: 2020-09-14 11:30:51
 * @Description: git 工具
 */
import sh from 'shelljs'

export function hasGit(): boolean {
  return !!sh.which('git')
}

export function initGitRepository(path: string = '.', silent = true): boolean {
  const { stderr } = sh
    .cd(path)
    .exec('git init && git add . && git commit -am "feat: init project"', { silent })
  return !stderr
}
