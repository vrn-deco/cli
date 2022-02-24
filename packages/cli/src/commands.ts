/*
 * @Author: Cphayim
 * @Date: 2022-01-24 18:00:52
 * @Description: collect commands
 */
import configCommand from '@vrn-deco/cli-command-config'
import boilerplateCommand, { createCommand } from '@vrn-deco/cli-command-boilerplate'

export default [
  createCommand, //
  boilerplateCommand, //
  configCommand, //
]
