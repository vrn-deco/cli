/*
 * @Author: Cphayim
 * @Date: 2021-07-29 16:09:40
 * @Description: boilerplate list command
 */
import { Command, runAction } from '@vrn-deco/cli-command'
import { ListAction } from './action.js'

const listCommand = new Command('list')

/**
 * e.g.
 * vrn boilerplate list
 * vrn boilerplate list --json
 * vrn boilerplate list --json --out-file ./boilerplate.json
 * vrn boilerplate list --yaml
 * vrn boilerplate list --yaml --out-file ./boilerplate.yaml
 */
listCommand
  .alias('ls')
  .description('list available boilerplate')
  .option('--json', 'print to json', false)
  .option('--yml, --yaml', 'print to yaml', false)
  .option('-o, --out-file <file>', 'output file')
  .action(runAction(ListAction))

export default listCommand
