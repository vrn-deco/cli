/*
 * @Author: Cphayim
 * @Date: 2019-06-24 09:00:38
 * @LastEditTime: 2019-06-24 09:01:26
 * @Description: 注册模块别名
 */

import { join } from 'path'
import moduleAlias from 'module-alias'

moduleAlias.addAlias('@', join(__dirname, '..'))
