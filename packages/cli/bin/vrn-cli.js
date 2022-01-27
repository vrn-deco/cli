#!/usr/bin/env node
if (require('import-local')(__filename)) {
  require('@vrn-deco/logger').logger.info('vrn-cli 正在使用本地版本')
} else {
  require('../lib').main()
}
